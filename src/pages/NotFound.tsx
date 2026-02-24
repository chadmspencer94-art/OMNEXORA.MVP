import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — CollabTodo</title>
      </Helmet>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-7xl font-bold text-surface-800 mb-4">404</div>
          <h1 className="text-xl font-bold text-surface-50 mb-2">Page not found</h1>
          <p className="text-sm text-surface-700 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
