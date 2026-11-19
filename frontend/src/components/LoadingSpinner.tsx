interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullPage?: boolean
}

export default function LoadingSpinner({ size = 'md', text, fullPage }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  }[size]

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`animate-spin rounded-full ${sizeClass} border-indigo-200 border-t-indigo-600`} />
      {text && <p className="text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return <LoadingSpinner size="lg" text={text} fullPage />
}
