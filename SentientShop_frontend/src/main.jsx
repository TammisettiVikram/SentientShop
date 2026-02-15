import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import "./index.css";
import App from "./App";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

function ThemeShell() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme_mode") || "light");

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("theme-dark", isDark);
    localStorage.setItem("theme_mode", theme);
  }, [theme]);

  return (
    <>
      <button
        onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        className="fixed bottom-4 right-4 z-50 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-md"
      >
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>
      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Elements stripe={stripePromise}>
      <ThemeShell />
    </Elements>
  </BrowserRouter>
);
