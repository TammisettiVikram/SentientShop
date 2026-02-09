import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Products() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        api.get("products/").then(res => setProducts(res.data));
    }, []);

    return (
        <div>
            {products.map(p => (
                <div key={p.id}>
                    <h2>{p.name}</h2>
                    {p.variants.map(v => (
                        <p key={v.id}>
                            {v.size} / {v.color} — ₹{v.price}
                        </p>
                    ))}
                </div>
            ))}
        </div>
    );
}
