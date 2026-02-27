import { AuthProvider, useAuth } from "./auth/AuthContext";
import { CartProvider, useCart } from "./cart/CartContext";
import { FavoritesProvider, useFavorites } from "./favorites/FavoritesContext";

const StoreProvider = ({ children }) => (
  <AuthProvider>
    <CartProvider>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
    </CartProvider>
  </AuthProvider>
);

export { StoreProvider, useAuth, useCart, useFavorites };
