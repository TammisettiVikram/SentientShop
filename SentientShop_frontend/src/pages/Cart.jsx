import { useEffect, useState } from "react";
import { api } from "../api/clients";
import { Link } from "react-router-dom";

export default function Cart() {
    const [items, setItems] = useState([]);

    const fetchCart = async () => {
        const res = await api.get("/cart/");
        setItems(res.data);
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const updateQuantity = async (itemId, newQty) => {
        await api.patch(`/cart/${itemId}/`, {
            quantity: newQty,
        });
        fetchCart();
    };

    const removeItem = async (itemId) => {
        await api.delete(`/cart/${itemId}/`);
        fetchCart();
    };

    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

            {items.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-4 rounded shadow flex justify-between items-center"
                        >
                            <div>
                                <h2 className="font-semibold">{item.product}</h2>
                                <p className="text-sm text-gray-500">
                                    {item.size} / {item.color}
                                </p>
                                <p className="text-sm">₹{item.price}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        updateQuantity(item.id, item.quantity - 1)
                                    }
                                    className="px-2 border"
                                >
                                    -
                                </button>

                                <span>{item.quantity}</span>

                                <button
                                    onClick={() =>
                                        updateQuantity(item.id, item.quantity + 1)
                                    }
                                    className="px-2 border"
                                >
                                    +
                                </button>

                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="ml-4 text-red-500"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-between items-center mt-6">
                        <h2 className="text-xl font-bold">Total: ₹{total}</h2>

                        <Link
                            to="/checkout"
                            className="bg-black text-white px-6 py-2 rounded"
                        >
                            Checkout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
