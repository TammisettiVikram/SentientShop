import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";

import PaymentForm from "../components/PaymentForm";
import api from "../api/clients";
import { stripePromise } from "../api/stripe";
import { getGuestCart, setGuestCart } from "../utils/cart";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [isGuest, setIsGuest] = useState(false);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setItems(getGuestCart());
      setIsGuest(true);
      return;
    }

    try {
      const res = await api.get("/cart/");
      setItems(res.data);
      setIsGuest(false);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) {
      return;
    }

    if (isGuest) {
      const updated = items.map((item, idx) => (idx === itemId ? { ...item, quantity: newQty } : item));
      setItems(updated);
      setGuestCart(updated);
      return;
    }

    await api.patch(`/cart/${itemId}/`, { quantity: newQty });
    fetchCart();
  };

  const removeItem = async (itemId) => {
    if (isGuest) {
      const updated = items.filter((_, idx) => idx !== itemId);
      setItems(updated);
      setGuestCart(updated);
      return;
    }

    await api.delete(`/cart/${itemId}/`);
    fetchCart();
  };

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0).toFixed(2),
    [items]
  );

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Your Cart</h1>
          <Link to="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
            Continue Shopping
          </Link>
        </header>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-slate-600">Your cart is empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <section
                key={isGuest ? index : item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <h2 className="font-bold text-slate-900">{item.product}</h2>
                  <p className="text-sm text-slate-500">
                    {item.size} / {item.color}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">Rs. {item.price}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(isGuest ? index : item.id, item.quantity - 1)}
                    className="rounded border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
                  >
                    -
                  </button>

                  <span className="w-8 text-center font-semibold">{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(isGuest ? index : item.id, item.quantity + 1)}
                    className="rounded border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeItem(isGuest ? index : item.id)}
                    className="ml-2 rounded border border-red-200 px-3 py-1 text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </section>
            ))}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-lg text-slate-600">Total</p>
                <p className="text-2xl font-black text-slate-900">Rs. {total}</p>
              </div>

              {isGuest ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-700">Login to sync your guest cart and complete payment.</p>
                  <Link
                    to="/login"
                    className="mt-3 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                  >
                    Login to Checkout
                  </Link>
                </div>
              ) : (
                <Elements stripe={stripePromise}>
                  <PaymentForm total={Number(total)} />
                </Elements>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
