import { useEffect, useState } from 'react'
import { ordersApi, type Order } from '../api'
import { useAuth } from '../store'
import { Link } from 'react-router-dom'
import { PageLoader } from '../components/LoadingSpinner'
import { Package, ChevronRight, CheckCircle, Clock, Truck, XCircle, ShoppingBag } from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50', icon: <Clock size={14} /> },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50', icon: <CheckCircle size={14} /> },
  shipped: { label: 'Shipped', color: 'text-indigo-600 bg-indigo-50', icon: <Truck size={14} /> },
  delivered: { label: 'Delivered', color: 'text-green-600 bg-green-50', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50', icon: <XCircle size={14} /> },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50' },
  completed: { label: 'Paid', color: 'text-green-600 bg-green-50' },
  failed: { label: 'Failed', color: 'text-red-600 bg-red-50' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }
    ordersApi.getAll(user.id)
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [isAuthenticated, user])

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <Package size={56} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Login to view your orders</h2>
          <Link to="/login" className="btn-primary inline-block mt-4">Sign In</Link>
        </div>
      </div>
    )
  }

  if (loading) return <PageLoader text="Loading orders..." />

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center text-red-500">
      <p className="font-semibold">{error}</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Package size={24} />
        My Orders
        {orders.length > 0 && (
          <span className="text-sm font-normal text-gray-400 ml-1">({orders.length} orders)</span>
        )}
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <ShoppingBag size={56} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">Start shopping to see your orders here!</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={18} /> Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderStatus = statusConfig[order.status] || statusConfig.pending
            const payStatus = order.payment ? (paymentStatusConfig[order.payment.status] || paymentStatusConfig.pending) : null
            const isExpanded = expanded === order.id

            return (
              <div key={order.id} className="card overflow-visible">
                <button
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition rounded-2xl"
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-gray-900 text-sm">
                        Rs. {Number(order.totalAmount || order.totalPrice || 0).toLocaleString()}
                      </p>
                    </div>
                    <span className={`badge ${orderStatus.color} flex items-center gap-1`}>
                      {orderStatus.icon}
                      {orderStatus.label}
                    </span>
                    {payStatus && (
                      <span className={`badge ${payStatus.color} hidden sm:flex`}>
                        {payStatus.label}
                      </span>
                    )}
                    <ChevronRight
                      size={18}
                      className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                    <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Shipping Address</p>
                        <p className="text-gray-700">{order.shippingAddress}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Payment</p>
                        <p className="text-gray-700 capitalize">
                          {order.paymentMethod?.replace('_', ' ')} 
                          {payStatus && (
                            <span className={`ml-2 badge ${payStatus.color}`}>{payStatus.label}</span>
                          )}
                        </p>
                        {order.payment?.transactionId && (
                          <p className="text-xs text-gray-400 font-mono mt-0.5">Txn: {order.payment.transactionId}</p>
                        )}
                      </div>
                    </div>

                    {order.orderItems && order.orderItems.length > 0 && (
                      <div>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Items</p>
                        <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                              <span className="text-gray-700">
                                {item.product?.name || `Product`} × {item.quantity}
                              </span>
                              <span className="font-semibold text-gray-900">
                                Rs. {(Number(item.price) * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end mt-3 pt-3 border-t">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-lg font-bold text-indigo-600">
                          Rs. {Number(order.totalAmount || order.totalPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
