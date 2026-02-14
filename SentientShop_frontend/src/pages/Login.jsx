import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/clients";
import { mergeGuestCart } from "../utils/cart";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login/", { email, password });
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("user_meta", JSON.stringify({
        role: res.data.role,
        is_staff: res.data.is_staff,
        is_superuser: res.data.is_superuser,
        email: res.data.email,
      }));

      await mergeGuestCart();
      const isAdmin = Boolean(res.data?.is_staff || res.data?.is_superuser || res.data?.role === "ADMIN");
      navigate(isAdmin ? "/admin" : "/cart");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to sync your cart and continue checkout.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-900"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-900"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 py-2.5 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          New here?{" "}
          <Link to="/register" className="font-semibold text-slate-900 underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
