# Self-hosted image resizing (imgproxy)

Replaces ArvanCloud's paid image-resize add-on. Frontend code
([src/utils/cdnImage.ts](../src/utils/cdnImage.ts)) rewrites storage image URLs into
imgproxy URLs sized to each image box (`srcset`/`sizes`), so the browser downloads a
~20–60 KB WebP instead of the full original. ArvanCloud CDN caches the resized outputs
at the edge, so after the first request per size the VPS does no work.

```
browser → img.luxera.ir (ArvanCloud CDN, cached)
        → origin nginx :80 → imgproxy container :8095
        → fetches original once from luxera-images…arvanstorage.ir
```

> **Host choice (2026-07-06):** `img.luxera.ir`, not `img.shoorbaloo.com`. The
> `shoorbaloo.com` zone turned out to be on **Cloudflare** (not ArvanCloud), and
> `image.shoorbaloo.com` does not currently resolve at all. The live product API returns
> `image.luxera.ir` URLs, and the `luxera.ir` zone is on Arvan where the CDN page rules
> live — so everything runs under `luxera.ir`.

**Status 2026-07-06:** steps 1 and 2 are deployed and smoke-tested on the VPS.
Remaining: step 3 (Arvan panel — manual) and redeploying the frontend (step 4).

Until `PUBLIC_IMAGE_CDN` is set (and after any failure), the frontend falls back to the
original URLs — deploying the frontend first is safe.

## 1. imgproxy container on the VPS (37.32.12.238)

```bash
docker run -d --name imgproxy --restart always \
  -p 127.0.0.1:8095:8080 \
  --memory 512m \
  -e IMGPROXY_ALLOWED_SOURCES="https://image.luxera.ir/,https://image.shoorbaloo.com/,https://luxera-images.hot.ir-central1.arvanstorage.ir/" \
  -e IMGPROXY_MAX_SRC_RESOLUTION=40 \
  -e IMGPROXY_WORKERS=2 \
  -e IMGPROXY_QUALITY=80 \
  -e IMGPROXY_TTL=31536000 \
  -e IMGPROXY_USE_ETAG=true \
  ghcr.io/imgproxy/imgproxy:latest
```

Notes:

- `ALLOWED_SOURCES` + `MAX_SRC_RESOLUTION` close the open-proxy/SSRF hole that unsigned
  URLs would otherwise leave. No key/salt needed — it can only resize our own bucket.
- Port 8095 assumed free — check with `ss -ltnp | grep 8095` first.
- `--memory 512m` fits the box (3.8 GiB, other containers capped at 256m).

Smoke test on the box (base64url of a real image URL, no padding):

```bash
B64=$(printf 'https://image.luxera.ir/products/7cbf02cb-5a51-4121-a144-a36e8e275cef.webp' \
  | base64 | tr '+/' '-_' | tr -d '=')
curl -s -o /dev/null -w '%{http_code} %{size_download}\n' \
  "http://127.0.0.1:8095/insecure/rs:fill:320:320/${B64}.webp"
```

## 2. nginx server block

`/etc/nginx/sites-available/imgproxy` (symlink into `sites-enabled`, then `nginx -t && systemctl reload nginx`):

```nginx
server {
    listen 80;
    server_name img.shoorbaloo.com img.luxera.ir;

    location / {
        proxy_pass http://127.0.0.1:8095;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 30s;
    }
}
```

## 3. ArvanCloud panel

In the **`luxera.ir`** zone (shoorbaloo.com is on Cloudflare — see host-choice note above):

1. **DNS**: add `img` A record → `37.32.12.238` with the CDN cloud **enabled**.
2. **Page Rule**: `img.luxera.ir/*` → Cache: _Apply QueryString_, Cache Max Age: **1 year**
   (resized outputs are immutable — the URL encodes the source and size).
3. Keep the existing `image.luxera.ir` record pointing at the bucket — originals must stay
   reachable (imgproxy fetches them, and old/unproxied URLs keep working).

## 4. Frontend

`.env.production` has `PUBLIC_IMAGE_CDN=https://img.luxera.ir`. The env is baked at build
time, so **only redeploy `luxera` after the `img.luxera.ir` DNS record resolves** —
otherwise every product image points at a dead host.

To use a size in code:

```tsx
import { imgSet, imgUrl } from '../utils/cdnImage'

<img {...imgSet(url, { widths: [320, 480, 640], ratio: 1, sizes: '(max-width: 720px) 50vw, 370px' })} … />
// or a fixed thumbnail:
<img src={imgUrl(url, 160, 160)} width={80} height={80} … />
```

`widths` are device pixels (≈ box CSS width × 2 for retina); `ratio` (w/h) crops
server-side to match the box; `sizes` tells the browser the box's rendered CSS width.

## Verification after go-live

- `curl -sI 'https://img.luxera.ir/insecure/rs:fill:320:320/<b64>.webp'` twice →
  second response `x-cache: HIT`.
- Lighthouse on luxera.ir → "Improve image delivery" savings should drop to ~0.
- Requests to a non-allowlisted source must return 404 (open-proxy check):
  `/insecure/rs:fill:100:100/plain/https://example.com/x.jpg` → 404.
