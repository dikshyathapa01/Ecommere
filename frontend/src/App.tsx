import { Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, CartProvider } from './store'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CartPage from './pages/CartPage'
import PaymentCallbackPage from './pages/PaymentCallbackPage'
import OrdersPage from './pages/OrdersPage'
import CreateProductPage from './pages/CreateProductPage'
import AdminPage from './pages/AdminPage'

function AppContent() {
  const location = useLocation()
  const [cartOpen, setCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Pages that have their own full-screen layout (no navbar/footer)
  const noNavPages = ['/login', '/register', '/payment-callback']
  const hideNav = noNavPages.includes(location.pathname)

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && (
        <Navbar
          onSearch={(q) => setSearchQuery(q)}
          searchValue={searchQuery}
        />
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CartPage />} />
          <Route path="/payment-callback" element={<PaymentCallbackPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products/new" element={<CreateProductPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
                <div>
                  <h1 className="text-6xl font-extrabold text-gray-200 mb-4">404</h1>
                  <p className="text-gray-600 text-lg font-medium">Page not found</p>
                  <a href="/" className="mt-6 btn-primary inline-block">Go Home</a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      {!hideNav && (
        <footer className="bg-gray-900 text-gray-400 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid sm:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="text-white font-semibold mb-3">ShopNepal</h4>
                <p className="text-sm leading-relaxed">Nepal's trusted e-commerce platform. Shop thousands of products with secure Khalti payments.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-1.5">
                  <li><a href="/" className="hover:text-white transition">Home</a></li>
                  <li><a href="/cart" className="hover:text-white transition">Cart</a></li>
                  <li><a href="/orders" className="hover:text-white transition">My Orders</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Payment</h4>
                <div className="flex items-center gap-2 bg-[#5C2D91] text-white px-4 py-2 rounded-lg w-fit">
                  <span className="font-bold">K</span>
                  <span>Khalti Secure</span>
                </div>
                <p className="text-xs mt-2">Sandbox mode: Use test credentials</p>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-6 text-center text-xs">
              © {new Date().getFullYear()} ShopNepal. Built with NestJS + React + Khalti Sandbox.
            </div>
          </div>
        </footer>
      )}

      {/* Cart Drawer (triggered from anywhere) */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}
