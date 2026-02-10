import { useEffect, useState } from "react";
import { api } from "../api/clients";

export default function Products() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        api.get("/products/")
            .then(res => setProducts(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Products</h1>

            {products.length === 0 && (
                <p className="text-gray-500">No products yet</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(product => (
                    <div
                        key={product.id}
                        className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition"
                    >
                        <h2 className="font-semibold text-lg">{product.name}</h2>
                        <p className="text-gray-600 mt-2">
                            {product.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
