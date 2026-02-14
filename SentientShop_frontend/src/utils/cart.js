import api from "../api/clients";

const GUEST_CART_KEY = "guest_cart";

export function getGuestCart() {
  return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
}

export function setGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}

export function addToGuestCart(variantData) {
  const cart = getGuestCart();
  const variantId = variantData.variant_id ?? variantData.variantId ?? variantData.id;
  const existing = cart.find((item) => item.variant_id === variantId);

  if (existing) {
    existing.quantity += variantData.quantity || 1;
  } else {
    cart.push({
      variant_id: variantId,
      product: variantData.product,
      size: variantData.size,
      color: variantData.color,
      price: Number(variantData.price),
      quantity: variantData.quantity || 1,
    });
  }

  setGuestCart(cart);
  return cart;
}

export async function mergeGuestCart() {
  const cart = getGuestCart();
  if (!cart.length) {
    return;
  }

  for (const item of cart) {
    await api.post("/cart/", {
      variant: item.variant_id,
      quantity: item.quantity,
    });
  }

  clearGuestCart();
}
