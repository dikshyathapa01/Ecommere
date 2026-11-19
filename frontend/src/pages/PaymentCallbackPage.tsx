import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { paymentsApi } from '../api'
import { useAuth } from '../store'
import { CheckCircle, XCircle, Loader2, ShoppingBag, ArrowLeft, Receipt } from 'lucide-react'

type PaymentState = 'loading' | 'success' | 'failed' | 'cancelled'

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState<PaymentState>('loading')
  const [txnId, setTxnId] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const pidx = searchParams.get('pidx') || ''
  const status = searchParams.get('status') || ''
  const paymentId = searchParams.get('paymentId') || ''
  const gateway = searchParams.get('gateway') || 'khalti'

  useEffect(() => {
    async function verify() {
      // If status from Khalti is not "Completed", mark as failed/cancelled
      if (status && status !== 'Completed') {
        setState(status.toLowerCase() === 'cancelled' ? 'cancelled' : 'failed')
        setErrorMsg(`Payment ${status.toLowerCase()}`)
        return
      }

      if (!pidx || !paymentId || !isAuthenticated) {
        // Try to show success/fail based on URL status alone
        if (status === 'Completed') {
          setState('success')
        } else {
          setState('failed')
          setErrorMsg('Missing payment information or not logged in')
        }
        return
      }

      try {
        const { data } = await paymentsApi.verifyKhalti(pidx, paymentId)
        setTxnId(data.transactionId || pidx)
        setState('success')
      } catch (err: any) {
        const msg = err.response?.data?.message
        setErrorMsg(msg || 'Payment verification failed')
        setState('failed')
      }
    }

    verify()
  }, [pidx, paymentId, status, isAuthenticated])

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <Loader2 size={56} className="mx-auto text-[#5C2D91] animate-spin mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Verifying Payment</h2>
          <p className="text-gray-500 text-sm mt-2">Please wait while we confirm your payment with Khalti...</p>
        </div>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h1>
          <p className="text-gray-500 mb-6">
            Your order has been confirmed and payment received via {gateway.charAt(0).toUpperCase() + gateway.slice(1)}.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-green-600 flex items-center gap-1">
                <CheckCircle size={14} /> Completed
              </span>
            </div>
            {txnId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono text-xs text-gray-700 max-w-[180px] truncate">{txnId}</span>
              </div>
            )}
            {pidx && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment ID (pidx)</span>
                <span className="font-mono text-xs text-gray-700 max-w-[180px] truncate">{pidx}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Gateway</span>
              <span className="font-semibold text-[#5C2D91]">{gateway.charAt(0).toUpperCase() + gateway.slice(1)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/orders"
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Receipt size={18} /> View My Orders
            </Link>
            <Link
              to="/"
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={48} className="text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-500 mb-6">
            You cancelled the payment. Your order has not been processed.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/cart" className="btn-primary flex items-center justify-center gap-2">
              <ArrowLeft size={18} /> Back to Cart
            </Link>
            <Link to="/" className="btn-secondary flex items-center justify-center gap-2">
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Failed
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center animate-fade-in">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={48} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-2">
          Unfortunately, your payment could not be processed.
        </p>
        {errorMsg && (
          <div className="bg-red-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-red-600 font-mono">{errorMsg}</p>
          </div>
        )}
        <p className="text-sm text-gray-400 mb-6">
          Please try again or contact support if the problem persists.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/cart" className="btn-khalti flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Try Again
          </Link>
          <Link to="/" className="btn-secondary flex items-center justify-center gap-2">
            <ShoppingBag size={18} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
