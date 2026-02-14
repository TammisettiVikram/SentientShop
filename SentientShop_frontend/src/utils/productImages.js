const PRODUCT_IMAGE_MAP = {
  "shirt jeans": "/images/Shirt Jeans.jpeg",
  "titan pro max 15": "/images/Titan Pro Max 15.webp",
  "zenith fold 5g": "/images/Mobile.avif",
  "nova lite a3": "/images/Nova Lite A3.webp",
  "aura gaming phone x": "/images/Aura Gaming Phone X.jpg",
  "pixel bloom compact": "/images/Pixel Bloom Compact.webp",
  "urban explorer bomber": "/images/Urban Explorer Bomber.jpg",
  "meadow silk wrap dress": "/images/Meadow Silk Wrap Dress.webp",
  "iron-free oxford shirt": "/images/Iron-Free Oxford Shirt.avif",
  "heritage denim jacket": "/images/Heritage Denim Jacket.jpg",
  "glow-hydra serum": "/images/Glow-Hydra Serum.png",
  "velvet matte lipstick": "/images/Velvet Matte Lipstick.jpg",
  "mineral shield sunscreen": "/images/Mineral Shield Sunscreen.jpg",
  "midnight repair cream": "/images/Midnight Repair Cream.jpg",
  "pure clay charcoal mask": "/images/Pure Clay Charcoal Mask.jpg",
  "sonicsilence headphones": "/images/SonicSilence Headphones.jpg",
  "stratos smartwatch 4": "/images/Stratos Smartwatch 4.webp",
  "mechanical ghost keyboard": "/images/Mechanical Ghost Keyboard.webp",
  "voltstream power bank": "/images/VoltStream Power Bank.webp",
  "visionary vr headset": "/images/Visionary VR Headset.webp",
};

const CATEGORY_FALLBACK_IMAGE = {
  BEAUTY_PRODUCTS: "/images/Beauty%20Products.jpg",
  CLOTHS: "/images/Clothes.webp",
  GADGETS: "/images/Gadgets.jpg",
  MOBILES: "/images/Mobiles.avif",
};

export function getProductImage(productName, category) {
  const key = String(productName || "").trim().toLowerCase();
  return PRODUCT_IMAGE_MAP[key] || CATEGORY_FALLBACK_IMAGE[category] || "/images/Gadgets.jpg";
}
