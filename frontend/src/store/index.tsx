import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, cartApi, type CartItem } from '../api'
import toast from 'react-hot-toast'

// ── Auth Context ──────────────────────────────────────────────────────────────
interface User {
  id: string
  name: string
  email: string
  role: string
  address: string
  PhoneNumber: string
}

interface AuthCtx {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  async function login(email: string, password: string) {
    const { data } = await authApi.login(email, password)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    // Fetch user profile
    const { data: profile } = await authApi.me()
    setUser(profile)
    localStorage.setItem('user', JSON.stringify(profile))
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// ── Cart Context ──────────────────────────────────────────────────────────────
interface CartCtx {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  loading: boolean
  fetchCart: () => Promise<void>
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartCtx>({} as CartCtx)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce((s, i) => s + i.quantity * (i.product?.price || 0), 0)

  async function fetchCart() {
    if (!isAuthenticated) { setItems([]); return }
    setLoading(true)
    try {
      const { data } = await cartApi.get()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function addToCart(productId: string, quantity = 1) {
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return }
    await cartApi.add(productId, quantity)
    toast.success('Added to cart!')
    await fetchCart()
  }

  async function updateQuantity(id: string, quantity: number) {
    if (quantity < 1) { await removeItem(id); return }
    await cartApi.update(id, quantity)
    await fetchCart()
  }

  async function removeItem(id: string) {
    await cartApi.remove(id)
    toast.success('Item removed')
    await fetchCart()
  }

  async function clearCart() {
    await cartApi.clear()
    setItems([])
  }

  useEffect(() => { fetchCart() }, [isAuthenticated])

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
