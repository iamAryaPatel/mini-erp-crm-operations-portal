import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CustomerListPage from './pages/customers/CustomerListPage';
import CustomerFormPage from './pages/customers/CustomerFormPage';
import CustomerDetailPage from './pages/customers/CustomerDetailPage';
import ProductListPage from './pages/products/ProductListPage';
import ProductFormPage from './pages/products/ProductFormPage';
import InventoryPage from './pages/inventory/InventoryPage';
import ChallanListPage from './pages/challans/ChallanListPage';
import ChallanCreatePage from './pages/challans/ChallanCreatePage';
import ChallanDetailPage from './pages/challans/ChallanDetailPage';
import UsersPage from './pages/users/UsersPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: { 
              fontFamily: 'var(--font-family)', 
              fontSize: '14px',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            },
          }} />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="customers" element={<ProtectedRoute roles={['ADMIN', 'SALES', 'ACCOUNTS']}><CustomerListPage /></ProtectedRoute>} />
              <Route path="customers/new" element={<ProtectedRoute roles={['ADMIN', 'SALES']}><CustomerFormPage /></ProtectedRoute>} />
              <Route path="customers/:id" element={<ProtectedRoute roles={['ADMIN', 'SALES', 'ACCOUNTS']}><CustomerDetailPage /></ProtectedRoute>} />
              <Route path="customers/:id/edit" element={<ProtectedRoute roles={['ADMIN', 'SALES']}><CustomerFormPage /></ProtectedRoute>} />
              <Route path="products" element={<ProductListPage />} />
              <Route path="products/new" element={<ProtectedRoute roles={['ADMIN', 'WAREHOUSE']}><ProductFormPage /></ProtectedRoute>} />
              <Route path="products/:id/edit" element={<ProtectedRoute roles={['ADMIN', 'WAREHOUSE']}><ProductFormPage /></ProtectedRoute>} />
              <Route path="inventory" element={<ProtectedRoute roles={['ADMIN', 'WAREHOUSE', 'ACCOUNTS']}><InventoryPage /></ProtectedRoute>} />
              <Route path="challans" element={<ProtectedRoute roles={['ADMIN', 'SALES', 'ACCOUNTS']}><ChallanListPage /></ProtectedRoute>} />
              <Route path="challans/new" element={<ProtectedRoute roles={['ADMIN', 'SALES']}><ChallanCreatePage /></ProtectedRoute>} />
              <Route path="challans/:id" element={<ProtectedRoute roles={['ADMIN', 'SALES', 'ACCOUNTS']}><ChallanDetailPage /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute roles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
