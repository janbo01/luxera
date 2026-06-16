import { apiFetch } from './client'

const BASE = import.meta.env.PUBLIC_PAYMENT_API as string

export interface ApiInitiatePaymentInput {
  order_id: string
  provider: string
}

export interface ApiInitiatePaymentResponse {
  payment_id: string
  provider: string
  redirect_url: string
}

export interface ApiPaymentProvider {
  id: string
}

export async function getPaymentProviders(): Promise<ApiPaymentProvider[]> {
  const res = await apiFetch<{ providers: ApiPaymentProvider[] }>(`${BASE}/payments/providers`)
  return res?.providers ?? []
}

export async function initiatePayment(
  data: ApiInitiatePaymentInput,
): Promise<ApiInitiatePaymentResponse> {
  return apiFetch<ApiInitiatePaymentResponse>(`${BASE}/payments`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
