import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Luxera] Uncaught error:', error, info.componentStack) // eslint-disable-line no-console
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', gap: '16px',
          fontFamily: 'var(--persian-body)', direction: 'rtl',
        }}>
          <h2 style={{ fontSize: '20px', color: 'var(--plum)' }}>مشکلی پیش آمد</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center' }}>
            لطفاً صفحه را رفرش کنید یا به صفحه‌ی اصلی بازگردید.
          </p>
          <button
            style={{
              padding: '10px 24px', background: 'var(--plum)', color: '#fff',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px',
            }}
            onClick={() => { window.location.href = '/' }}
          >
            بازگشت به خانه
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
