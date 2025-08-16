// src/App.tsx
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./modules/auth/AuthContext";

import ShelfPage from "./modules/shelf/ShelfPage";
import AddPlantPage from "./modules/shelf/AddPlantPage";
import SignInPage from "./modules/auth/SignInPage";
import NotFoundPage from "./modules/common/NotFoundPage";
import AdminPage from "./modules/admin/AdminPage";
import VerifyEmailPage from "./modules/auth/VerifyEmailPage";

import AdminRoute from "./modules/auth/AdminRoute";
import { useIsAdmin } from "./modules/auth/useIsAdmin";

export default function App() {
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  // ✅ Don’t render routes/redirects until we know the auth state
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-zinc-500">
        Restoring session…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg">🌿 PlantShelf</Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/" className="hover:underline">My Shelf</Link>
                <Link to="/add" className="hover:underline">Add Plant</Link>
                {user.emailVerified && isAdmin && (
                  <Link to="/admin" className="hover:underline">Admin</Link>
                )}
                {!user.emailVerified && (
                  <Link to="/verify-email" className="hover:underline">Verify Email</Link>
                )}
                <button
                  onClick={signOut}
                  className="px-3 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                className="px-3 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        <Routes>
          <Route
            path="/"
            element={user ? <ShelfPage /> : <Navigate to="/signin" replace />}
          />
          <Route
            path="/add"
            element={user ? <AddPlantPage /> : <Navigate to="/signin" replace />}
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/signin"
            element={!user ? <SignInPage /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-4 text-sm text-zinc-500">
          © {new Date().getFullYear()} PlantShelf — Free MVP
        </div>
      </footer>
    </div>
  );
}
