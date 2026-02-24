import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthForm } from './components/Auth/AuthForm'
import { Home } from './pages/Home'
import { SharedList } from './pages/SharedList'
import { LoadingSkeleton } from './components/LoadingSkeleton'

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth()

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout user={user} onSignOut={signOut}>
          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <Routes>
              <Route path="/shared/:token" element={<SharedList />} />
              <Route
                path="*"
                element={
                  user ? (
                    <Home userId={user.id} />
                  ) : (
                    <AuthForm onSignIn={signIn} onSignUp={signUp} />
                  )
                }
              />
            </Routes>
          )}
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
