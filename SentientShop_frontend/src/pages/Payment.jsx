import { useEffect, useState } from "react";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import api from "../api/clients";
import { Spinner } from "../components/LoadingUI";
import { stripePromise } from "../api/stripe";

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [statusText, setStatusText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.post("/orders/create-payment-intent/").then((res) => setClientSecret(res.data.client_secret));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !clientSecret) {
      return;
    }

    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (error) {
      setStatusText(error.message || "Payment failed.");
      toast.error(error.message || "Payment failed.");
    } else if (paymentIntent.status === "succeeded") {
      setStatusText("Payment successful.");
      toast.success("Order placed successfully");
      navigate("/payment-success");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="rounded-lg border border-slate-300 p-3">
        <CardElement />
      </div>
      {statusText ? <p className="text-sm text-slate-700">{statusText}</p> : null}
      <button
        type="submit"
        disabled={!stripe || !clientSecret || loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Spinner label="Processing payment..." /> : "Pay Now"}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="mb-4 text-2xl font-black text-slate-900">Payment</h1>
        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      </div>
    </div>
  );
}
