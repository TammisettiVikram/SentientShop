import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/clients";

const TABS = ["profile", "orders", "invoices"];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    api
      .get("/auth/me/")
      .then((res) => setProfile(res.data))
      .catch(() => navigate("/login"));

    api
      .get("/orders/")
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]));
  }, [navigate]);

  const invoiceOrders = useMemo(() => orders.filter((order) => order.invoice_available), [orders]);

  const updateProfile = async () => {
    try {
      const payload = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        username: profile.username,
        email: profile.email,
      };
      const res = await api.patch("/auth/me/", payload);
      setProfile(res.data);
      setStatusMessage("Profile updated.");
    } catch (err) {
      setStatusMessage(err.response?.data?.detail || "Could not update profile.");
    }
  };

  const changePassword = async () => {
    try {
      await api.post("/auth/change-password/", passwordForm);
      setPasswordForm({ current_password: "", new_password: "" });
      setStatusMessage("Password updated.");
    } catch (err) {
      setStatusMessage(err.response?.data?.detail || "Could not update password.");
    }
  };

  const printInvoice = (order) => {
    const html = `
      <html>
      <head><title>${order.invoice_number}</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px">
        <h2>Invoice ${order.invoice_number}</h2>
        <p>Order ID: ${order.id}</p>
        <p>Status: ${order.status}</p>
        <p>Date: ${new Date(order.created_at).toLocaleString()}</p>
        <hr/>
        ${order.items
          .map(
            (item) =>
              `<p>${item.product} (${item.size}/${item.color}) - Rs. ${item.price} x ${item.quantity}</p>`
          )
          .join("")}
        <hr/>
        <h3>Total: Rs. ${order.total_amount}</h3>
      </body>
      </html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  if (!profile) {
    return <div className="p-8 text-slate-600">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">User Dashboard</h1>
              <p className="text-sm text-slate-500">Manage profile, track orders, and access invoices.</p>
            </div>
            <Link to="/" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
              Store
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === tab ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"}`}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {statusMessage ? <p className="text-sm text-slate-700">{statusMessage}</p> : null}

        {activeTab === "profile" ? (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Profile</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={profile.first_name || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, first_name: e.target.value }))}
                placeholder="First name"
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={profile.last_name || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, last_name: e.target.value }))}
                placeholder="Last name"
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={profile.username || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Username"
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={profile.email || ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button onClick={updateProfile} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Save Profile
            </button>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="mb-2 font-semibold text-slate-900">Change Password</h3>
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))}
                  placeholder="Current password"
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))}
                  placeholder="New password (min 8 chars)"
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button onClick={changePassword} className="mt-3 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Update Password
              </button>
            </div>
          </section>
        ) : null}

        {activeTab === "orders" ? (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Order Tracking & History</h2>
            {!orders.length ? <p className="text-sm text-slate-600">No orders yet.</p> : null}
            {orders.map((order) => (
              <article key={order.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">Order #{order.id}</p>
                  <p className="text-sm text-slate-600">{order.status}</p>
                </div>
                <p className="text-sm text-slate-600">Invoice: {order.invoice_number}</p>
                <p className="text-sm text-slate-600">Total: Rs. {order.total_amount}</p>
              </article>
            ))}
          </section>
        ) : null}

        {activeTab === "invoices" ? (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Invoices</h2>
            {!invoiceOrders.length ? <p className="text-sm text-slate-600">No paid invoices available.</p> : null}
            {invoiceOrders.map((order) => (
              <article key={order.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-slate-900">{order.invoice_number}</p>
                  <p className="text-sm text-slate-600">Order #{order.id}</p>
                </div>
                <button onClick={() => printInvoice(order)} className="rounded bg-slate-900 px-3 py-1 text-sm text-white">
                  Print Invoice
                </button>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
