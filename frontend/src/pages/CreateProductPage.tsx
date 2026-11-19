import { useState } from 'react'
import { ArrowLeft, ImagePlus, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { productsApi, type Product } from '../api'

type Variant = { color: string; size: string; stock: number }
type Category = Product['category']

const categories: { value: Category; label: string; description: string }[] = [
  { value: 'electronics', label: 'Electronics', description: 'Gadgets and devices' },
  { value: 'cloth', label: 'Cloth', description: 'Fashion and clothing' },
  { value: 'phones', label: 'Phones', description: 'Mobile phones and accessories' },
  { value: 'speakers', label: 'Speakers', description: 'Audio and speakers' },
]

export default function CreateProductPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    brand: '',
    category: 'electronics' as Category,
  })
  const [variants, setVariants] = useState<Variant[]>([{ color: '', size: '', stock: 0 }])
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  function updateForm(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateVariant(index: number, field: keyof Variant, value: string) {
    setVariants((current) => current.map((variant, variantIndex) => {
      if (variantIndex !== index) return variant
      return { ...variant, [field]: field === 'stock' ? Number(value) : value }
    }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (variants.some((variant) => !variant.color.trim() || !variant.size.trim() || variant.stock < 0)) {
      toast.error('Complete all variants before publishing')
      return
    }

    setLoading(true)
    try {
      await productsApi.create({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        brand: form.brand.trim(),
        price: Number(form.price),
        variant: variants,
        images,
      })
      toast.success('Product created successfully')
      navigate('/')
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string | string[] } } })
        .response?.data?.message
      toast.error(Array.isArray(message) ? message.join(', ') : message || 'Could not create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6">
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
        <p className="text-gray-500 mt-1 mb-6">Choose a product section and add its details.</p>

        <form onSubmit={submit} className="space-y-5">
          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Product section</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.value}
                  onClick={() => updateForm('category', category.value)}
                  className={`text-left rounded-lg border p-4 transition ${
                    form.category === category.value
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <span className="block font-semibold text-gray-900">{category.label}</span>
                  <span className="block text-xs text-gray-500 mt-1">{category.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Product details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label>
                <span className="block text-sm font-medium text-gray-700 mb-1">Name</span>
                <input required className="input-field" value={form.name} onChange={(e) => updateForm('name', e.target.value)} />
              </label>
              <label>
                <span className="block text-sm font-medium text-gray-700 mb-1">Brand</span>
                <input required className="input-field" value={form.brand} onChange={(e) => updateForm('brand', e.target.value)} />
              </label>
              <label>
                <span className="block text-sm font-medium text-gray-700 mb-1">Price (NPR)</span>
                <input required min="0.01" step="0.01" type="number" className="input-field" value={form.price} onChange={(e) => updateForm('price', e.target.value)} />
              </label>
              <label className="md:col-span-2">
                <span className="block text-sm font-medium text-gray-700 mb-1">Description</span>
                <textarea required rows={4} className="input-field resize-y" value={form.description} onChange={(e) => updateForm('description', e.target.value)} />
              </label>
            </div>
          </section>

          <section className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Images and variants</h2>
              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                <ImagePlus size={16} /> Add images
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImages(Array.from(e.target.files ?? []))} />
              </label>
            </div>
            {images.length > 0 && <p className="text-sm text-gray-500 mb-4">{images.length} image(s) selected</p>}
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                  <label>
                    <span className="block text-xs text-gray-500 mb-1">Color</span>
                    <input required className="input-field" value={variant.color} onChange={(e) => updateVariant(index, 'color', e.target.value)} />
                  </label>
                  <label>
                    <span className="block text-xs text-gray-500 mb-1">Size</span>
                    <input required className="input-field" value={variant.size} onChange={(e) => updateVariant(index, 'size', e.target.value)} />
                  </label>
                  <label>
                    <span className="block text-xs text-gray-500 mb-1">Stock</span>
                    <input required min="0" type="number" className="input-field" value={variant.stock} onChange={(e) => updateVariant(index, 'stock', e.target.value)} />
                  </label>
                  <button type="button" disabled={variants.length === 1} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30" onClick={() => setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index))} aria-label="Remove variant">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-secondary mt-4 inline-flex items-center gap-2" onClick={() => setVariants((current) => [...current, { color: '', size: '', stock: 0 }])}>
              <Plus size={16} /> Add variant
            </button>
          </section>

          <div className="flex justify-end gap-3">
            <Link to="/" className="btn-secondary">Cancel</Link>
            <button disabled={loading} className="btn-primary" type="submit">{loading ? 'Creating...' : 'Create product'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
