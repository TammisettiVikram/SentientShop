import { useEffect, useState } from "react";
import { api } from "../api/clients";
import { addToGuestCart } from "../utils/cart"
import { Link } from "react-router-dom";


export default function Products() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        api.get("/products/").then(res => setProducts(res.data));
    }, []);

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Products</h1>

            {products.map(product => (
                <div className="flex justify-end gap-4 mb-4">
                    <Link to="/login" className="text-sm underline">Login</Link>
                    <Link to="/register" className="text-sm underline">Register</Link>
                </div>
                ,
                <div
                    key={product.id}
                    className="bg-white rounded-xl shadow p-4 mb-4"
                >
                    <h2 className="font-semibold text-lg">{product.name}</h2>
                    <p className="text-gray-600 mb-3">
                        {product.description}
                    </p>

                    {/* VARIANTS */}
                    {product.variants.map(variant => (
                        <div
                            key={variant.id}
                            className="flex items-center justify-between border-t pt-3 mt-3"
                        >
                            <div>
                                <p className="text-sm">
                                    {variant.size} / {variant.color}
                                </p>
                                <p className="font-semibold">
                                    ₹{variant.price}
                                </p>
                            </div>

                            <button
                                onClick={async () => {
                                    try {
                                        const res = await api.post("/cart/", {
                                            variant: variant.id,
                                            quantity: 1,
                                        });
                                        console.log("Added to cart:", res.data);
                                    } catch (err) {
                                        console.log("CART ERROR STATUS:", err.response?.status);
                                        console.log("CART ERROR DATA:", err.response?.data);
                                    }
                                }}
                            >
                                Add to Cart
                            </button>
                            <Link
                                to="/cart"
                                className="text-sm px-3 py-1 border rounded hover:bg-black hover:text-white"
                            >
                                Cart
                            </Link>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
