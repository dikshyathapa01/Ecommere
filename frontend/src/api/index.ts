import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    name: string
    email: string
    password: string
    PhoneNumber: string
    address: string
    role?: 'user' | 'admin'
  }) => {
    const { role: _role, ...registrationData } = data
    void _role
    return api.post('/users/register', registrationData)
  },
  login: (email: string, password: string) =>
    api.post<{ token: string; role: string }>('/users/login', { email, password }),
  me: () => api.get('/users/me'),
}

// ── Products ──────────────────────────────────────────────────────────────────
export interface Product {
  id: string
  name: string
  price: number
  description: string
  brand: string
  category: 'electronics' | 'cloth' | 'phones' | 'speakers'
  imageIds: string[]
  variant: { color: string; size: string; stock: number }[]
}

export interface CreateProductInput {
  name: string
  price: number
  description: string
  brand: string
  category: Product['category']
  variant: { color: string; size: string; stock: number }[]
  images?: File[]
}

export const productsApi = {
  getAll: () => api.get<Product[]>('/products'),
  getOne: (id: string) => api.get<Product>(`/products/${id}`),
  create: (product: CreateProductInput) => {
    const formData = new FormData()
    formData.append('name', product.name)
    formData.append('price', String(product.price))
    formData.append('description', product.description)
    formData.append('brand', product.brand)
    formData.append('category', product.category)
    formData.append('variant', JSON.stringify(product.variant))
    product.images?.forEach((image) => formData.append('imageIds', image))
    return api.post<Product>('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export interface AdminStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
}

export const adminApi = {
  stats: () => api.get<AdminStats>('/admin/dashboard'),
  products: () => api.get<Product[]>('/admin/products'),
  orders: () => api.get<Order[]>('/admin/orders'),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
}

// ── Categories ────────────────────────────────────────────────────────────────
export interface Category {
  id: number
  name: string
  description?: string
  isActive: boolean
}

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories?isActive=true'),
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string
  quantity: number
  productId: string
  userId: string
  product: Product
  createdAt: string
}

export const cartApi = {
  get: () => api.get<CartItem[]>('/shopping-cart'),
  add: (productId: string, quantity: number) => api.post('/shopping-cart', { productId, quantity }),
  update: (id: string, quantity: number) => api.put(`/shopping-cart/${id}`, { quantity }),
  remove: (id: string) => api.delete(`/shopping-cart/${id}`),
  clear: () => api.delete('/shopping-cart/clear'),
}

// ── Orders ───────────────────────────────────────────────────────────────────
export interface OrderItem {
  id: string
  quantity: number
  price: number
  product: Product
}

export interface Order {
  id: string
  userId: string
  totalAmount: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: string
  paymentMethod: string
  orderDate: string
  orderItems: OrderItem[]
  payment?: { id: string; status: string; gateway: string; transactionId?: string }
}

export const ordersApi = {
  create: (data: {
    orderItems: { product: { id: string }; quantity: number; price: number }[]
    shippingAddress: string
    paymentMethod: string
  }) => api.post<Order>('/orders', data),
  getAll: (userId?: string) =>
    api.get<Order[]>(`/orders${userId ? `?userId=${userId}` : ''}`),
  getOne: (id: string) => api.get<Order>(`/orders/${id}`),
}

// ── Payments ──────────────────────────────────────────────────────────────────
export interface PaymentInitResponse {
  payment: { id: string; status: string; amount: number }
  gateway: string
  paymentUrl: string
  pidx?: string
  orderId: string
}

export const paymentsApi = {
  initiate: (orderId: string, gateway: 'khalti' | 'esewa') =>
    api.post<PaymentInitResponse>('/payments/create', { orderId, gateway }),
  verifyKhalti: (pidx: string, paymentId: string) =>
    api.post('/payments/khalti/verify', { pidx, paymentId }),
  history: () => api.get('/payments/history'),
}
