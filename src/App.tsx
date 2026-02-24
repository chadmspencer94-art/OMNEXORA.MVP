import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Home } from "@/pages/Home";
import { SharedList } from "@/pages/SharedList";
import { NotFound } from "@/pages/NotFound";

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <AuthGuard>
                        <Home />
                      </AuthGuard>
                    }
                  />
                  <Route path="/shared/:token" element={<SharedList />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
