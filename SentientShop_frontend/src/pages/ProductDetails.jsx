import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/clients";
import { addToGuestCart } from "../utils/cart";
import { getProductImage } from "../utils/productImages";

export default function ProductDetails() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewDraft, setReviewDraft] = useState({ rating: "5", comment: "" });
  const [message, setMessage] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get(`/products/${productId}/`)
      .then((res) => {
        setProduct(res.data);
        setSelectedVariantId(res.data.variants?.[0]?.id || null);
      })
      .catch(() => setProduct(null));
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/products/${productId}/reviews/`);
      setReviews(res.data);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const selectedVariant = useMemo(
    () => product?.variants?.find((variant) => variant.id === selectedVariantId),
    [product, selectedVariantId]
  );

  const addToCart = async () => {
    if (!product || !selectedVariant) {
      return;
    }
    try {
      await api.post("/cart/", { variant: selectedVariant.id, quantity: 1 });
      setMessage("Item added to your cart.");
    } catch {
      addToGuestCart({
        variant_id: selectedVariant.id,
        product: product.name,
        size: selectedVariant.size,
        color: selectedVariant.color,
        price: selectedVariant.price,
        quantity: 1,
      });
      setMessage("Item added to guest cart. Login to sync it.");
    }
    setTimeout(() => setMessage(""), 2400);
  };

  const submitReview = async () => {
    try {
      await api.post(`/products/${productId}/reviews/`, {
        rating: Number(reviewDraft.rating),
        comment: reviewDraft.comment,
      });
      setReviewMessage("Review saved.");
      setReviewDraft({ rating: "5", comment: "" });
      fetchReviews();
    } catch (err) {
      setReviewMessage(err.response?.data?.detail || "Review could not be submitted.");
    }
  };

  if (!product) {
    return <div className="p-8 text-slate-600">Loading product...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link to="/" className="text-sm font-semibold text-slate-700 underline">
          Back to products
        </Link>

        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img src={getProductImage(product.name, product.category)} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{product.name}</h1>
            <p className="mt-2 text-slate-600">{product.description}</p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-700">Select Variant</p>
              <select
                value={selectedVariantId || ""}
                onChange={(e) => setSelectedVariantId(Number(e.target.value))}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.size} / {variant.color} - Rs. {variant.price} (Stock: {variant.stock})
                  </option>
                ))}
              </select>
              {selectedVariant ? (
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-bold text-slate-900">Rs. {selectedVariant.price}</p>
                  <button onClick={addToCart} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                    Add to Cart
                  </button>
                </div>
              ) : null}
              {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Reviews</h2>
          <div className="mt-3 space-y-2">
            {reviews.length ? (
              reviews.map((review) => (
                <article key={review.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-800">
                    {review.user_email} - {review.rating}/5
                  </p>
                  <p className="text-slate-600">{review.comment || "No comment"}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No reviews yet.</p>
            )}
          </div>

          {token ? (
            <div className="mt-4 rounded-lg border border-slate-200 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-700">Post a review (only if purchased)</p>
              <div className="mb-2 flex gap-2">
                <select
                  value={reviewDraft.rating}
                  onChange={(e) => setReviewDraft((prev) => ({ ...prev, rating: e.target.value }))}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Star
                    </option>
                  ))}
                </select>
                <button onClick={submitReview} className="rounded bg-slate-900 px-3 py-1 text-sm text-white">
                  Submit
                </button>
              </div>
              <textarea
                value={reviewDraft.comment}
                onChange={(e) => setReviewDraft((prev) => ({ ...prev, comment: e.target.value }))}
                className="h-20 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                placeholder="Write your review"
              />
              {reviewMessage ? <p className="mt-1 text-xs text-slate-600">{reviewMessage}</p> : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Login to submit reviews.</p>
          )}
        </section>
      </div>
    </div>
  );
}
