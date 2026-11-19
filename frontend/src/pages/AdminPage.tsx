import { useEffect, useState } from 'react'
import { BarChart3, Package, Plus, ShoppingBag, Trash2, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminApi, type AdminStats, type Product } from '../api'
import { useAuth } from '../store'

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    if (user?.role !== 'admin') {
      navigate('/', { replace: true })
      return
    }

    Promise.all([adminApi.stats(), adminApi.products()])
      .then(([statsResponse, productsResponse]) => {
        setStats(statsResponse.data)
        setProducts(productsResponse.data)
      })
      .catch(() => toast.error('Could not load admin dashboard'))
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate, user?.role])

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) return
    try {
      await adminApi.deleteProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setStats((current) => current ? { ...current, totalProducts: current.totalProducts - 1 } : current)
      toast.success('Product deleted')
    } catch {
      toast.error('Could not delete product')
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Admin panel</p>
            <h1 className="text-3xl font-bold text-gray-900">Store dashboard</h1>
          </div>
          <Link to="/products/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={17} /> Add product
          </Link>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Products', value: stats?.totalProducts ?? 0, icon: Package },
                { label: 'Users', value: stats?.totalUsers ?? 0, icon: Users },
                { label: 'Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag },
                { label: 'Revenue', value: `Rs. ${(stats?.totalRevenue ?? 0).toLocaleString('en-NP')}`, icon: BarChart3 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white rounded-xl border p-5 flex items-center gap-4">
                  <div className="bg-indigo-50 text-indigo-600 rounded-lg p-3"><Icon size={20} /></div>
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <section className="bg-white rounded-xl border overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Products</h2>
                <span className="text-sm text-gray-500">{products.length} total</span>
              </div>
              <div className="divide-y">
                {products.map((product) => (
                  <div key={product.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.category} · Rs. {product.price.toLocaleString('en-NP')}
                      </p>
                    </div>
                    <button onClick={() => deleteProduct(product)} className="text-gray-400 hover:text-red-600 p-2" aria-label={`Delete ${product.name}`}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
