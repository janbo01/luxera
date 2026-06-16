export function useNavigate() {
  return async (path: string) => {
    const { navigate } = await import('astro:transitions/client')
    await navigate(path)
  }
}
