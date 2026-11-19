import { ShoppingCart, Star, Eye } from 'lucide-react'
import { useCart } from '../store'
import type { Product } from '../api'

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dtwp4lemc/image/upload/'

function getImageUrl(imageIds: string[]) {
  if (!imageIds || imageIds.length === 0) return null
  const id = imageIds[0]
  if (id.startsWith('http')) return id
  if (id.startsWith('/')) return id
  return `${CLOUDINARY_BASE}${id}`
}

function formatNPR(price: number) {
  return `Rs. ${price.toLocaleString('en-NP')}`
}

function StarRating({ rating }: { rating?: number }) {
  if (rating === undefined) {
    return <span className="text-xs text-gray-400">No reviews yet</span>
  }
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
        />
      ))}
      <span className="text-xs text-gray-500 ml-0.5">({rating.toFixed(1)})</span>
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onViewDetail: (product: Product) => void
}

export default function ProductCard({ product, onViewDetail }: ProductCardProps) {
  const { addToCart } = useCart()
  const imgUrl = getImageUrl(product.imageIds)
  const totalStock = product.variant?.reduce((sum, v) => sum + Number(v.stock || 0), 0) || 0
  const inStock = totalStock > 0

  return (
    <div className="card group flex flex-col">
      {/* Image */}
      <div
        className="relative bg-gray-100 overflow-hidden cursor-pointer"
        style={{ aspectRatio: '4/3' }}
        onClick={() => onViewDetail(product)}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart size={40} className="text-gray-300" />
          </div>
        )}
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetail(product) }}
            className="bg-white text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-md"
          >
            <Eye size={14} /> Quick View
          </button>
        </div>
        {/* Brand badge */}
        {product.brand && (
          <span className="absolute top-2 left-2 badge bg-white/90 text-gray-600 shadow-sm text-xs">
            {product.brand}
          </span>
        )}
        {!inStock && (
          <span className="absolute top-2 right-2 badge bg-red-100 text-red-700">Out of stock</span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3
          className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => onViewDetail(product)}
        >
          {product.name}
        </h3>
        <StarRating />
        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{product.description}</p>

        {/* Variants preview */}
        {product.variant && product.variant.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.variant.slice(0, 3).map((v, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {v.color} / {v.size}
              </span>
            ))}
            {product.variant.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                +{product.variant.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-lg font-bold text-gray-900">{formatNPR(product.price)}</span>
          <button
            onClick={() => addToCart(product.id)}
            disabled={!inStock}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <ShoppingCart size={15} />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export { formatNPR, getImageUrl, StarRating }
