import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart, useAuth } from '../store'
import { formatNPR, getImageUrl } from '../components/ProductCard'
import { ordersApi, paymentsApi } from '../api'
import { ShoppingCart, Trash2, Plus, Minus, MapPin, ArrowRight, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import KhaltiLogo from '../components/KhaltiLogo'

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [shippingAddress, setShippingAddress] = useState(user?.address || '')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'cart' | 'checkout'>('cart')

  async function handleKhaltiCheckout() {
    if (!isAuthenticated) {
      toast.error('Please login first')
      navigate('/login', { state: { from: { pathname: '/cart' } } })
      return
    }
    if (!shippingAddress || shippingAddress.length < 10) {
      toast.error('Please enter a valid shipping address (min 10 characters)')
      return
    }
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)
    try {
      // 1. Create the order
      const orderPayload = {
        orderItems: items.map((i) => ({
          product: { id: i.productId },
          quantity: i.quantity,
          price: i.product?.price || 0,
        })),
        shippingAddress,
        paymentMethod: 'khalti' as const,
      }

      const { data: order } = await ordersApi.create(orderPayload)
      toast.success('Order created! Initiating payment...')

      // 2. Initiate Khalti payment
      const { data: payment } = await paymentsApi.initiate(order.id, 'khalti')

      // 3. Clear cart and redirect to Khalti
      await clearCart()
      window.location.href = payment.paymentUrl
    } catch (err: any) {
      const msg = err.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && step === 'cart') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <ShoppingCart size={56} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Discover amazing products and add them to your cart.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Package size={18} />
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingCart size={24} />
        {step === 'cart' ? 'Shopping Cart' : 'Checkout'}
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {step === 'cart' ? (
            <>
              {items.map((item) => {
                const imgUrl = getImageUrl(item.product?.imageIds || [])
                return (
                  <div key={item.id} className="card flex gap-4 p-4">
                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.product?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.product?.name}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 transition flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{item.product?.brand}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-bold text-indigo-600">
                          {formatNPR((item.product?.price || 0) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              <button
                onClick={() => setStep('checkout')}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
              >
                Continue to Checkout <ArrowRight size={18} />
              </button>
            </>
          ) : (
            /* Checkout shipping form */
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-indigo-600" />
                Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Shipping Address *
                  </label>
                  <textarea
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Street, City, District, Nepal (minimum 10 characters)"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {shippingAddress.length}/10 min characters
                  </p>
                </div>
                {user && (
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Phone:</strong> {user.PhoneNumber}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('cart')} className="btn-secondary flex-1">
                  ← Back to Cart
                </button>
              </div>

              {/* Khalti Pay Button */}
              <div className="mt-4">
                <button
                  onClick={handleKhaltiCheckout}
                  disabled={loading || shippingAddress.length < 10}
                  className="btn-khalti w-full py-3 text-base"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <KhaltiLogo />
                      Pay {formatNPR(totalPrice)} with Khalti
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-400 mt-2">
                  🔒 Secure sandbox payment via Khalti
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-gray-600">
                  <span className="truncate max-w-[180px]">{i.product?.name} × {i.quantity}</span>
                  <span className="font-medium flex-shrink-0">{formatNPR((i.product?.price || 0) * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatNPR(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3 mt-2">
                <span>Total</span>
                <span className="text-indigo-600">{formatNPR(totalPrice)}</span>
              </div>
            </div>

            {step === 'cart' && (
              <div className="mt-4 bg-purple-50 rounded-xl p-3 text-sm text-center text-[#5C2D91]">
                <KhaltiLogo />
                <p className="mt-1 font-medium">Pay securely with Khalti</p>
                <p className="text-xs text-gray-500 mt-0.5">Nepal's trusted payment gateway</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
