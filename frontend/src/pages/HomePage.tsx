import { useEffect, useState } from 'react'
import { productsApi, categoriesApi, type Product, type Category } from '../api'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import { PageLoader } from '../components/LoadingSpinner'
import { Search, TrendingUp, Zap } from 'lucide-react'

interface HomePageProps {
  searchQuery?: string
}

export default function HomePage({ searchQuery = '' }: HomePageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState(searchQuery)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => { setSearch(searchQuery) }, [searchQuery])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      productsApi.getAll(),
      categoriesApi.getAll(),
    ])
      .then(([{ data: p }, { data: c }]) => {
        setProducts(p)
        setCategories(c)
      })
      .catch(() => setError('Failed to load products. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader text="Loading products..." />
  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
        <p className="text-red-600 font-semibold text-lg">{error}</p>
        <p className="text-sm text-red-400 mt-2">Check that your backend is running on port 3000.</p>
        <button onClick={() => window.location.reload()} className="mt-4 btn-primary text-sm">
          Retry
        </button>
      </div>
    </div>
  )

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === 'all' ||
      String((p as Product & { category?: { id: string | number } }).category?.id) === selectedCategory
    return matchSearch && matchCategory
  })

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-200 text-sm mb-3 font-medium">
              <Zap size={16} className="fill-indigo-300 text-indigo-300" />
              Nepal's Favourite Online Store
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              Shop the Best,<br />
              <span className="text-indigo-200">Delivered to You</span>
            </h1>
            <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
              Discover thousands of products with fast delivery across Nepal. Pay securely with Khalti.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-lg"
                  placeholder="Search for products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap gap-8 justify-center sm:justify-start">
          {[
            { label: 'Products', value: products.length.toString() },
            { label: 'Free Delivery', value: '✓' },
            { label: 'Secure Payment', value: 'Khalti' },
            { label: 'Support', value: '24/7' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-bold text-indigo-600">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Filters */}
      {categories.length > 0 && (
        <section className="bg-white border-b sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
            <div className="flex items-center gap-2 pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-4 py-1.5 text-sm rounded-full border transition font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(String(cat.id))}
                  className={`flex-shrink-0 px-4 py-1.5 text-sm rounded-full border transition font-medium ${
                    selectedCategory === String(cat.id)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {search ? `Results for "${search}"` : 'Featured Products'}
            </h2>
          </div>
          <span className="text-sm text-gray-500">{filtered.length} products</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-lg">No products found</p>
            <p className="text-sm mt-1">Try a different search term</p>
            <button onClick={() => setSearch('')} className="mt-4 btn-secondary text-sm">
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetail={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
