import { X, ShoppingCart, Plus, Minus } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '../api'
import { useCart } from '../store'
import { formatNPR, getImageUrl } from './ProductCard'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(0)

  if (!product) return null

  const imgUrl = getImageUrl(product.imageIds)
  const variant = product.variant?.[selectedVariant]
  const totalStock = product.variant?.reduce((sum, v) => sum + Number(v.stock || 0), 0) || 0
  const inStock = totalStock > 0

  function handleAdd() {
    addToCart(product!.id, quantity)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow hover:bg-gray-100 transition"
        >
          <X size={18} />
        </button>

        <div className="grid sm:grid-cols-2 gap-0">
          {/* Image */}
          <div className="bg-gray-100 rounded-tl-2xl rounded-bl-2xl overflow-hidden" style={{ minHeight: 300 }}>
            {imgUrl ? (
              <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart size={56} className="text-gray-300" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col gap-4">
            <div>
              {product.brand && (
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
              <h2 className="text-xl font-bold text-gray-900 mt-1">{product.name}</h2>
              <div className="text-xs text-gray-400 mt-1">No reviews yet</div>
            </div>

            <p className="text-2xl font-bold text-indigo-600">{formatNPR(product.price)}</p>

            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

            {/* Variants */}
            {product.variant && product.variant.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Variants</p>
                <div className="flex flex-wrap gap-2">
                  {product.variant.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(i)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                        selectedVariant === i
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }                       ${Number(v.stock) === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                      disabled={Number(v.stock) === 0}
                    >
                      {v.color} / {v.size}
                      {v.stock === 0 && ' (OOS)'}
                    </button>
                  ))}
                </div>
                {variant && (
                  <p className="text-xs text-gray-500 mt-1">
                    {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Qty:</span>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <button
                onClick={handleAdd}
                disabled={!inStock}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
