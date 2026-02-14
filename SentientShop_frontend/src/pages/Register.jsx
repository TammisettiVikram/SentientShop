import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/clients";
import { mergeGuestCart } from "../utils/cart";

export default function Register() {
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
      const res = await api.post("/auth/register/", { email, password });
      localStorage.setItem("token", res.data.access);

      await mergeGuestCart();
      navigate("/cart");
    } catch (err) {
      const message = err.response?.data?.email?.[0] || "Registration failed. Try another email.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Register to save your cart and track order history.</p>

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
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-slate-900 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
