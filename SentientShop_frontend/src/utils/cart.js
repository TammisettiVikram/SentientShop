import { api } from "../api/clients";

export function getGuestCart() {
    return JSON.parse(localStorage.getItem("guest_cart") || "[]");
}

export async function mergeGuestCart() {
    const cart = getGuestCart();
    if (!cart.length) return;

    for (const item of cart) {
        await api.post("/cart/", {
            variant_id: item.variant.id,
            quantity: item.quantity,
        });
    }

    localStorage.removeItem("guest_cart");
}

export function addToGuestCart(variant) {
    const cart = getGuestCart();
    const existing = cart.find(i => i.variant_id === variant.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            variant_id: variant.id,
            name: variant.product,
            price: variant.price,
            quantity: 1,
        });
    }

    localStorage.setItem("guest_cart", JSON.stringify(cart));
}
