import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/clients";
import { SkeletonRow } from "../components/LoadingUI";

const STATUS_BADGES = {
  PENDING: { label: "Pending", icon: "🟡", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  PAID: { label: "Paid", icon: "🟢", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  SHIPPED: { label: "Shipped", icon: "🚚", className: "bg-blue-100 text-blue-800 border-blue-200" },
  DELIVERED: { label: "Delivered", icon: "📦", className: "bg-violet-100 text-violet-800 border-violet-200" },
  CANCELLED: { label: "Cancelled", icon: "⛔", className: "bg-rose-100 text-rose-800 border-rose-200" },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/")
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-3">
          {[...Array(4)].map((_, idx) => (
            <SkeletonRow key={idx} />
          ))}
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Your Orders</h1>
        <p className="mt-3 text-slate-600">No orders yet.</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-slate-900 underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-black tracking-tight text-slate-900">Your Orders</h1>

        {orders.map((order) => {
          const badge = STATUS_BADGES[order.status] || STATUS_BADGES.PENDING;
          return (
            <section key={order.id} className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-900">Order #{order.id}</p>
                  <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${badge.className}`}>
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </span>
                </div>
                <p className="text-lg font-black text-slate-900">Rs. {order.total_amount}</p>
              </div>

              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <article key={`${order.id}-${index}`} className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                    <div>
                      <p className="font-semibold text-slate-800">{item.product}</p>
                      <p className="text-slate-500">
                        {item.size} / {item.color}
                      </p>
                    </div>
                    <p className="text-slate-700">
                      Rs. {item.price} x {item.quantity}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
