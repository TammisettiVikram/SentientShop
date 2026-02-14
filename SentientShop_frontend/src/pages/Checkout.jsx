import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

import api from "../api/clients";

export default function Checkout() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { data } = await api.post("/orders/create-payment-intent/");
      const clientSecret = data.client_secret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setMessage(result.error.message || "Payment failed.");
      } else if (result.paymentIntent.status === "succeeded") {
        setMessage("Payment successful.");
      }
    } catch {
      setMessage("Could not initialize payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">Checkout</h2>
        <p className="mt-1 text-sm text-slate-500">Secure payment with Stripe.</p>

        <div className="mt-5 rounded-lg border border-slate-300 p-3">
          <CardElement />
        </div>

        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}

        <button
          onClick={handlePayment}
          disabled={!stripe || loading}
          className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
