import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import api from "../api/clients";

const ORDER_STATUS_OPTIONS = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const USER_ROLE_OPTIONS = ["CUSTOMER", "ADMIN", "SUPPORT"];
const PAGE_SIZE = 8;
const newVariantTemplate = {
  id: null,
  size: "",
  color: "",
  price: "",
  stock: "",
};

const emptyProductForm = {
  name: "",
  description: "",
  size: "",
  color: "",
  price: "",
  stock: "",
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [collapsed, setCollapsed] = useState({
    revenue: false,
    orders: false,
    products: false,
    users: false,
  });
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, productsRes, usersRes] = await Promise.all([
        api.get("/orders/admin/dashboard/"),
        api.get("/admin/products/"),
        api.get("/auth/admin/users/"),
      ]);
      setDashboard(dashboardRes.data);
      setProducts(productsRes.data);
      setUsers(usersRes.data);
      setError("");
    } catch {
      setError("Admin access required");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartRows = useMemo(() => {
    if (!dashboard?.charts) {
      return [];
    }

    const map = new Map();
    dashboard.charts.orders_by_day.forEach((row) => {
      map.set(row.date, { date: row.date, orders: row.orders, revenue: 0 });
    });
    dashboard.charts.revenue_by_day.forEach((row) => {
      const existing = map.get(row.date) || { date: row.date, orders: 0, revenue: 0 };
      existing.revenue = Number(row.revenue);
      map.set(row.date, existing);
    });
    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [dashboard]);

  const pagedOrders = useMemo(() => {
    const start = (orderPage - 1) * PAGE_SIZE;
    return dashboard?.orders?.slice(start, start + PAGE_SIZE) || [];
  }, [dashboard, orderPage]);

  const pagedProducts = useMemo(() => {
    const start = (productPage - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, productPage]);

  const pagedUsers = useMemo(() => {
    const start = (userPage - 1) * PAGE_SIZE;
    return users.slice(start, start + PAGE_SIZE);
  }, [users, userPage]);

  const updateOrderStatus = async (orderId, status) => {
    setDashboard((prev) => ({
      ...prev,
      orders: prev.orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
    }));

    try {
      await api.patch(`/orders/admin/orders/${orderId}/status/`, { status });
    } catch {
      setError("Failed to update order");
      fetchData();
    }
  };

  const updateUserField = (userId, field, value) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, [field]: value } : user)));
  };

  const saveUser = async (user) => {
    try {
      await api.patch(`/auth/admin/users/${user.id}/`, {
        role: user.role,
        is_active: user.is_active,
        is_staff: user.is_staff,
      });
    } catch {
      setError("Failed to update user");
      fetchData();
    }
  };

  const updateProductField = (productId, field, value) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === productId ? { ...product, [field]: value } : product))
    );
  };

  const updateVariantField = (productId, variantId, field, value) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id !== productId
          ? product
          : {
              ...product,
              variants: product.variants.map((variant) =>
                variant.id === variantId ? { ...variant, [field]: value } : variant
              ),
            }
      )
    );
  };

  const addVariantRow = (productId) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id !== productId
          ? product
          : {
              ...product,
              variants: [...product.variants, { ...newVariantTemplate, id: `new-${Date.now()}-${Math.random()}` }],
            }
      )
    );
  };

  const removeVariantRow = (productId, variantId) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id !== productId
          ? product
          : {
              ...product,
              variants: product.variants.filter((variant) => variant.id !== variantId),
            }
      )
    );
  };

  const saveProduct = async (product) => {
    try {
      await api.patch(`/admin/products/${product.id}/`, {
        name: product.name,
        description: product.description,
        variants: product.variants.map((variant) => ({
          ...(typeof variant.id === "number" ? { id: variant.id } : {}),
          size: variant.size,
          color: variant.color,
          price: Number(variant.price || 0),
          stock: Number(variant.stock || 0),
        })),
      });
    } catch {
      setError("Failed to update product");
      fetchData();
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await api.delete(`/admin/products/${productId}/`);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch {
      setError("Failed to delete product");
    }
  };

  const createProduct = async (event) => {
    event.preventDefault();
    try {
      await api.post("/admin/products/", {
        name: productForm.name,
        description: productForm.description,
        variants: [
          {
            size: productForm.size,
            color: productForm.color,
            price: Number(productForm.price),
            stock: Number(productForm.stock),
          },
        ],
      });
      setProductForm(emptyProductForm);
      fetchData();
    } catch {
      setError("Failed to create product");
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-600">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Admin Dashboard</h1>

        <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Orders" value={dashboard.metrics.total_orders} />
          <StatCard label="Paid Orders" value={dashboard.metrics.paid_orders} />
          <StatCard label="Pending Orders" value={dashboard.metrics.pending_orders} />
          <StatCard label="Products" value={dashboard.metrics.total_products} />
          <StatCard label="Users" value={dashboard.metrics.total_users} />
          <StatCard label="Revenue" value={`Rs. ${dashboard.metrics.total_revenue}`} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Revenue Summary"
            collapsed={collapsed.revenue}
            onToggle={() => setCollapsed((prev) => ({ ...prev, revenue: !prev.revenue }))}
          />
          {!collapsed.revenue ? (
            <>
          <div className="mb-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} name="Revenue (Rs.)" />
                <Line type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2 text-sm md:grid-cols-5">
            {dashboard.revenue_summary.map((summary) => (
              <div key={summary.status} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-700">{summary.status}</p>
                <p className="text-slate-500">{summary.count} orders</p>
              </div>
            ))}
          </div>
            </>
          ) : null}
        </section>

        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <SectionHeader
            title="Order Management"
            collapsed={collapsed.orders}
            onToggle={() => setCollapsed((prev) => ({ ...prev, orders: !prev.orders }))}
          />
          {!collapsed.orders ? (
            <>
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-600">
                <th className="p-2">Order</th>
                <th className="p-2">User</th>
                <th className="p-2">Total</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 text-sm">
                  <td className="p-2 font-semibold text-slate-800">#{order.id}</td>
                  <td className="p-2 text-slate-700">{order.user}</td>
                  <td className="p-2 text-slate-700">Rs. {order.total}</td>
                  <td className="p-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1 text-slate-700"
                    >
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls
            page={orderPage}
            setPage={setOrderPage}
            totalItems={dashboard.orders.length}
            pageSize={PAGE_SIZE}
          />
            </>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <SectionHeader
            title="Product CRUD"
            collapsed={collapsed.products}
            onToggle={() => setCollapsed((prev) => ({ ...prev, products: !prev.products }))}
          />
          {!collapsed.products ? (
            <>
          <form onSubmit={createProduct} className="mb-5 grid gap-2 md:grid-cols-6">
            <input
              placeholder="Name"
              value={productForm.name}
              onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1"
              required
            />
            <input
              placeholder="Description"
              value={productForm.description}
              onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1"
              required
            />
            <input
              placeholder="Size"
              value={productForm.size}
              onChange={(e) => setProductForm((prev) => ({ ...prev, size: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1"
              required
            />
            <input
              placeholder="Color"
              value={productForm.color}
              onChange={(e) => setProductForm((prev) => ({ ...prev, color: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={productForm.price}
              onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1"
              required
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Stock"
                value={productForm.stock}
                onChange={(e) => setProductForm((prev) => ({ ...prev, stock: e.target.value }))}
                className="w-full rounded border border-slate-300 px-2 py-1"
                required
              />
              <button className="rounded bg-slate-900 px-3 py-1 text-white">Add</button>
            </div>
          </form>

          <div className="space-y-4">
            {pagedProducts.map((product) => (
              <div key={product.id} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-2 grid gap-2 md:grid-cols-3">
                  <input
                    value={product.name}
                    onChange={(e) => updateProductField(product.id, "name", e.target.value)}
                    className="rounded border border-slate-300 px-2 py-1"
                  />
                  <input
                    value={product.description}
                    onChange={(e) => updateProductField(product.id, "description", e.target.value)}
                    className="rounded border border-slate-300 px-2 py-1 md:col-span-2"
                  />
                </div>

                {product.variants.map((variant) => (
                  <div key={variant.id} className="mb-2 grid gap-2 md:grid-cols-5">
                    <input
                      value={variant.size}
                      onChange={(e) => updateVariantField(product.id, variant.id, "size", e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1"
                    />
                    <input
                      value={variant.color}
                      onChange={(e) => updateVariantField(product.id, variant.id, "color", e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariantField(product.id, variant.id, "price", e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1"
                    />
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariantField(product.id, variant.id, "stock", e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1"
                    />
                    <button
                      onClick={() => removeVariantRow(product.id, variant.id)}
                      className="rounded border border-red-200 px-2 py-1 text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <button
                    onClick={() => addVariantRow(product.id)}
                    className="rounded border border-slate-300 px-3 py-1 text-slate-700"
                  >
                    Add Variant
                  </button>
                  <button onClick={() => saveProduct(product)} className="rounded bg-slate-900 px-3 py-1 text-white">
                    Save
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="rounded border border-red-200 px-3 py-1 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <PaginationControls
            page={productPage}
            setPage={setProductPage}
            totalItems={products.length}
            pageSize={PAGE_SIZE}
          />
            </>
          ) : null}
        </section>

        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <SectionHeader
            title="User Management"
            collapsed={collapsed.users}
            onToggle={() => setCollapsed((prev) => ({ ...prev, users: !prev.users }))}
          />
          {!collapsed.users ? (
            <>
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-600">
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Active</th>
                <th className="p-2">Staff</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 text-sm">
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserField(user.id, "role", e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1"
                    >
                      {USER_ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={user.is_active}
                      onChange={(e) => updateUserField(user.id, "is_active", e.target.checked)}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={user.is_staff}
                      onChange={(e) => updateUserField(user.id, "is_staff", e.target.checked)}
                    />
                  </td>
                  <td className="p-2">
                    <button onClick={() => saveUser(user)} className="rounded bg-slate-900 px-3 py-1 text-white">
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls
            page={userPage}
            setPage={setUserPage}
            totalItems={users.length}
            pageSize={PAGE_SIZE}
          />
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </article>
  );
}

function SectionHeader({ title, collapsed, onToggle }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <button onClick={onToggle} className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700">
        {collapsed ? "Expand" : "Collapse"}
      </button>
    </div>
  );
}

function PaginationControls({ page, setPage, totalItems, pageSize }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return (
    <div className="mt-3 flex items-center justify-end gap-2">
      <button
        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        disabled={page === 1}
        className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
      >
        Prev
      </button>
      <p className="text-sm text-slate-600">
        Page {page} / {totalPages}
      </p>
      <button
        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={page === totalPages}
        className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
