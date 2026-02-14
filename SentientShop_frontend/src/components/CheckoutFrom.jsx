import { useEffect, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import api from "../api/clients";

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState(null);

    useEffect(() => {
        api.post("/orders/checkout/").then(res => {
            setClientSecret(res.data.client_secret);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
            },
        });

        if (result.paymentIntent.status === "succeeded") {
            alert("Payment successful!");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <CardElement />
            <button className="mt-4 bg-black text-white px-4 py-2">
                Pay Now
            </button>
        </form>
    );
}
