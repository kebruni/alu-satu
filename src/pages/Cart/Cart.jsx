import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Cart.module.css";
import formatPrice from "../../utils/formatPrice";
import { createOrder } from "../../api/users.api";
import { useAuth, useCart } from "../../store";
import { useToast } from "../../components/Toast/Toast";

const Cart = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const toast = useToast();
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const receiptRef = useRef(null);

  const handleCheckout = async () => {
    if (!user) {
      toast("Войдите в аккаунт, чтобы оформить заказ", "error");
      return;
    }
    setIsProcessing(true);
    setPaymentMessage("");

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const orderItems = cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));
      const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

      let order;
      try {

        if (token) {
          const apiOrder = await createOrder({ items: orderItems, total, totalItems });
          order = {
            id: apiOrder._id || Date.now(),
            date: apiOrder.createdAt || new Date().toISOString(),
            userId: user?.id || null,
            username: user?.username || "Гость",
            items: orderItems.map(i => ({ id: i.productId, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
            total,
            totalItems,
          };
        } else {
          throw new Error("no token");
        }
      } catch {

        order = {
          id: Date.now(),
          date: new Date().toISOString(),
          userId: user?.id || null,
          username: user?.username || user?.email || "Гость",
          items: cart.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
          total,
          totalItems,
        };
      }

      try {
        const prev = JSON.parse(localStorage.getItem("orders") || "[]");
        prev.push(order);
        localStorage.setItem("orders", JSON.stringify(prev));
      } catch {  }

      clearCart();
      window.dispatchEvent(new Event("orders:changed"));

      setReceipt(order);
    } catch {
      setPaymentMessage("Ошибка при оплате. Попробуйте еще раз.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    const el = receiptRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=420,height=700");
    win.document.write(`
      <html><head><title>Чек Alu-Satu</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Courier New', monospace; padding: 20px; color: #000; background: #fff; }
        .receipt { max-width: 380px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
        .header h2 { font-size: 18px; margin-bottom: 4px; }
        .header p { font-size: 11px; color: #555; }
        .meta { font-size: 12px; margin-bottom: 12px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
        .meta div { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .items { margin-bottom: 12px; }
        .item { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px dotted #ddd; }
        .item-name { flex: 1; }
        .item-qty { width: 40px; text-align: center; }
        .item-price { width: 90px; text-align: right; font-weight: bold; }
        .total { border-top: 2px dashed #000; padding-top: 10px; font-size: 16px; font-weight: bold; display: flex; justify-content: space-between; margin-bottom: 16px; }
        .footer { text-align: center; font-size: 11px; color: #888; border-top: 1px dashed #ccc; padding-top: 10px; }
        .footer p { margin-bottom: 3px; }
        @media print { body { padding: 0; } }
      </style></head><body>
      ${el.innerHTML}
      <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  };

  const handleCloseReceipt = () => {
    setReceipt(null);
    navigate("/catalog");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const freeShippingThreshold = 50000;
  const shippingProgress = Math.min(100, (total / freeShippingThreshold) * 100);

  const fallbackImg = (seed) => `https://source.unsplash.com/featured/400x400?product&sig=${encodeURIComponent(String(seed ?? "0"))}`;

  const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`${styles.container} page-transition`}>
      <h1>Ваша корзина</h1>
      
      {paymentMessage && (
        <div className={`${styles.notification} ${styles.error}`}>
          {paymentMessage}
        </div>
      )}
      {receipt && (
        <div className={styles.receiptInline}>
          <div ref={receiptRef} className={styles.receiptContent}>
            <div className="receipt">
                <div className="header">
                  <h2>ALU-SATU</h2>
                  <p>Маркетплейс Казахстана</p>
                  <p>г. Караганды, ул. Акай Аксая, 11</p>
                  <p>+7 (999) 999-99-99</p>
                </div>

                <div className="meta">
                  <div><span>Чек №:</span><span>{receipt.id}</span></div>
                  <div><span>Дата:</span><span>{fmtDate(receipt.date)}</span></div>
                  <div><span>Покупатель:</span><span>{receipt.username}</span></div>
                  <div><span>Способ оплаты:</span><span>Онлайн</span></div>
                </div>

                <div className="items">
                  {receipt.items.map((item, idx) => (
                    <div key={idx} className="item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">×{item.quantity}</span>
                      <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="total">
                  <span>ИТОГО:</span>
                  <span>{formatPrice(receipt.total)}</span>
                </div>

                <div className="footer">
                  <p>Спасибо за покупку!</p>
                  <p>Товаров: {receipt.totalItems} шт.</p>
                  <p>alu-satu.com</p>
                </div>
            </div>
          </div>

          <div className={styles.receiptActions}>
            <button className={styles.printBtn} onClick={handlePrintReceipt}>
              Распечатать чек
            </button>
            <button className={styles.closeReceiptBtn} onClick={handleCloseReceipt}>
              Перейти в каталог →
            </button>
          </div>
        </div>
      )}
      
      {receipt ? null : cart.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          </div>
          <h2 className={styles.emptyTitle}>Корзина пуста</h2>
          <p className={styles.emptyText}>Добавьте товары, чтобы оформить заказ</p>
          <button className={styles.emptyBtn} onClick={handleContinueShopping}>Перейти к покупкам</button>
        </div>
      ) : (
        <>
          <div className={styles.shippingBar}>
            {total >= freeShippingThreshold ? (
              <p className={styles.shippingText}>Бесплатная доставка!</p>
            ) : (
              <p className={styles.shippingText}>
                До бесплатной доставки: <strong>{formatPrice(freeShippingThreshold - total)}</strong>
              </p>
            )}
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${shippingProgress}%` }} />
            </div>
          </div>

          <div className={styles.cartLayout}>
            <div className={styles.cartItems}>
              <div className={styles.itemsHeader}>
                <span>Товар</span>
                <span>{totalItems} шт.</span>
              </div>
              {cart.map((item) => (
                <div key={item.id} className={styles.item}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImg}
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (el.dataset.fallbackApplied) return;
                      el.dataset.fallbackApplied = "1";
                      el.src = fallbackImg(item.id);
                    }}
                  />
                  <div className={styles.itemInfo}>
                    <h3>{item.name}</h3>
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                  </div>
                  <div className={styles.itemControls}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div className={styles.itemTotal}>
                    <p>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <button 
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.summary}>
              <h2>Итого</h2>
              <div className={styles.summaryRow}>
                <span>Товары ({totalItems})</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Доставка</span>
                <span>{total >= freeShippingThreshold ? "Бесплатно" : formatPrice(2000)}</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryTotal}>
                <span>К оплате</span>
                <span>{formatPrice(total >= freeShippingThreshold ? total : total + 2000)}</span>
              </div>
              <button 
                className={styles.checkoutBtn}
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? "Обработка..." : "Оформить заказ"}
              </button>
              <button 
                className={styles.continueShopping}
                onClick={handleContinueShopping}
                disabled={isProcessing}
              >
                Продолжить покупки
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
