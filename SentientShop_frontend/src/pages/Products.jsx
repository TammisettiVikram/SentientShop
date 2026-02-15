import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/clients";
import { SkeletonCard } from "../components/LoadingUI";
import { getProductImage } from "../utils/productImages";

const CATEGORIES = [
  { slug: "beauty-products", key: "BEAUTY_PRODUCTS", label: "Beauty Products", icon: "B" },
  { slug: "cloths", key: "CLOTHS", label: "Cloths", icon: "C" },
  { slug: "gadgets", key: "GADGETS", label: "Gadgets", icon: "G" },
  { slug: "mobiles", key: "MOBILES", label: "Mobiles", icon: "M" },
];

const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((category) => [category.slug, category]));

const CATEGORY_BANNERS = {
  "beauty-products": "/images/Beauty%20Products.jpg",
  cloths: "/images/Clothes.webp",
  gadgets: "/images/Gadgets.jpg",
  mobiles: "/images/Mobiles.avif",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const activeCategory = categorySlug ? CATEGORY_BY_SLUG[categorySlug] : null;

  useEffect(() => {
    setLoading(true);
    api
      .get("/products/")
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (categorySlug && !CATEGORY_BY_SLUG[categorySlug]) {
      navigate("/", { replace: true });
    }
  }, [categorySlug, navigate]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products
      .filter((product) => (!activeCategory ? true : product.category === activeCategory.key))
      .filter((product) => (normalizedSearch ? product.name.toLowerCase().includes(normalizedSearch) : true))
      .filter((product) => {
        if (!maxPrice) {
          return true;
        }
        const floorPrice = Math.min(...product.variants.map((variant) => Number(variant.price)));
        return floorPrice <= Number(maxPrice);
      })
      .filter((product) => (inStockOnly ? product.variants.some((variant) => Number(variant.stock) > 0) : true));
  }, [products, activeCategory, search, maxPrice, inStockOnly]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-stone-100 to-slate-200 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">SentientShop</h1>
            <p className="text-sm text-slate-500">Choose a category and open a product page to select variants.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/cart" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Cart
            </Link>
            <Link to="/dashboard" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Dashboard
            </Link>
            <Link to="/login" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
              Login
            </Link>
          </div>
        </header>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/")}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${activeCategory ? "border-slate-300 text-slate-600" : "border-slate-900 bg-slate-900 text-white"}`}
            >
              All
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category.slug}
                onClick={() => navigate(`/category/${category.slug}`)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${activeCategory?.slug === category.slug ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
              >
                <span className="mr-2">{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max price"
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm text-slate-700">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
              In-stock only
            </label>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <button
              key={category.slug}
              onClick={() => navigate(`/category/${category.slug}`)}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm"
            >
              <div className="h-36 w-full overflow-hidden">
                <img
                  src={CATEGORY_BANNERS[category.slug]}
                  alt={category.label}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between p-3">
                <p className="font-bold text-slate-900">{category.label}</p>
                <span className="text-xl">{category.icon}</span>
              </div>
            </button>
          ))}
        </section>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : !filteredProducts.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No products found. Try a different filter or category.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <section key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-44 w-full overflow-hidden">
                  <img
                    src={getProductImage(product.name, product.category)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold text-slate-900">{product.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{product.description}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {product.variants.length} variants available
                  </p>
                  <Link
                    to={`/products/${product.id}`}
                    className="mt-4 inline-block rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black"
                  >
                    View Product
                  </Link>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
