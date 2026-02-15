import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import api from "../api/clients";
import { Spinner } from "../components/LoadingUI";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const orderId = Number(searchParams.get("order_id"));

  useEffect(() => {
    api
      .get("/orders/")
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const order = useMemo(() => orders.find((item) => item.id === orderId), [orders, orderId]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">Payment Successful</h1>
        <p className="mt-2 text-slate-600">Your order was placed successfully.</p>

        {loading ? (
          <div className="mt-5 text-slate-700">
            <Spinner label="Loading order summary..." />
          </div>
        ) : order ? (
          <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-bold text-slate-900">Order Summary #{order.id}</h2>
            <p className="mt-1 text-sm text-slate-600">Status: {order.status}</p>
            <p className="text-sm text-slate-600">Total: Rs. {order.total_amount}</p>
            <div className="mt-3 space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <p className="text-slate-700">
                    {item.product} ({item.size}/{item.color})
                  </p>
                  <p className="text-slate-700">
                    Rs. {item.price} x {item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <p className="mt-5 text-slate-600">Order summary is unavailable right now.</p>
        )}

        <div className="mt-6 flex gap-2">
          <Link to="/orders" className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Go to Orders
          </Link>
          <Link to="/" className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
