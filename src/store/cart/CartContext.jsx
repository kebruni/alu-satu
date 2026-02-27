import { createContext, useContext, useState, useCallback, useEffect } from "react";

const CartContext = createContext(null);

const readCart = () => {
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); }
  catch { return []; }
};

const calcCount = (items) => (items || []).reduce((s, i) => s + (i.quantity || 1), 0);

export const CartProvider = ({ children }) => {
  const [cart, setCartState] = useState(readCart);
  const [cartCount, setCartCount] = useState(() => calcCount(readCart()));

  const persist = (items) => {
    localStorage.setItem("cart", JSON.stringify(items));
    setCartState(items);
    setCartCount(calcCount(items));
    window.dispatchEvent(new CustomEvent("cart:changed"));
  };

  const addToCart = useCallback((product, qty = 1) => {
    const items = readCart();
    const existing = items.find((i) => String(i.id) === String(product.id));
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({ ...product, quantity: qty });
    }
    persist(items);
  }, []);

  const removeFromCart = useCallback((id) => {
    persist(readCart().filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, qty) => {
    if (qty <= 0) {
      persist(readCart().filter((i) => i.id !== id));
      return;
    }
    persist(readCart().map((i) => i.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
  }, []);

  const refreshCart = useCallback(() => {
    const items = readCart();
    setCartState(items);
    setCartCount(calcCount(items));
  }, []);

  useEffect(() => {
    const handler = () => refreshCart();
    window.addEventListener("cart:changed", handler);
    return () => window.removeEventListener("cart:changed", handler);
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
