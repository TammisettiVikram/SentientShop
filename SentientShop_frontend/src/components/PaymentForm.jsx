import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/clients";

export default function PaymentForm({ total }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/orders/create-payment-intent/", { amount: total });
      const clientSecret = data.client_secret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        navigate("/orders");
      }
    } catch {
      alert("Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
        <CardElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Processing..." : `Pay Rs. ${total.toFixed(2)}`}
      </button>
    </form>
  );
}
