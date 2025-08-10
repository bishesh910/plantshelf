import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-zinc-500 mb-4">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="underline">Go home</Link>
    </div>
  );
}
