import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <h3 className={styles.newsletterTitle}>Будьте в курсе лучших предложений</h3>
          <p className={styles.newsletterText}>Подпишитесь на рассылку и получайте скидки первыми</p>
        </div>
        <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.newsletterInput}
          />
          <button type="submit" className={styles.newsletterBtn}>
            {subscribed ? "Готово!" : "Подписаться"}
          </button>
        </form>
      </div>

      <div className={styles.content}>
        <div className={styles.column}>
          <div className={styles.footerBrand}>Alu-Satu</div>
          <p className={styles.footerDesc}>Маркетплейс Казахстана — лучшие товары по доступным ценам</p>
          <div className={styles.social}>
            <a href="https://www.tiktok.com/@akaiaksai" target="_blank" rel="noreferrer" title="TikTok">TT</a>
            <a href="https://www.instagram.com/akaiaksai" target="_blank" rel="noreferrer" title="Instagram">IG</a>
            <a href="https://t.me/akaiaksai" target="_blank" rel="noreferrer" title="Telegram">TG</a>
          </div>
        </div>

        <div className={styles.column}>
          <h4>О компании</h4>
          <ul>
            <li><Link to="/about">О нас</Link></li>
            <li><Link to="/about">История</Link></li>
            <li><Link to="/about">Карьера</Link></li>
            <li><Link to="/about">Пресс-центр</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Помощь</h4>
          <ul>
            <li><Link to="/help">Центр помощи</Link></li>
            <li><Link to="/help#how-to-buy">Как купить</Link></li>
            <li><Link to="/help#how-to-sell">Как продать</Link></li>
            <li><Link to="/help#delivery">Доставка и возврат</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Правовая информация</h4>
          <ul>
            <li><Link to="/terms">Условия использования</Link></li>
            <li><Link to="/privacy">Конфиденциальность</Link></li>
            <li><Link to="/cookies">Cookies</Link></li>
            <li><Link to="/security">Безопасность</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Контакты</h4>
          <ul>
            <li><a href="mailto:support@alu-satu.com">support@alu-satu.com</a></li>
            <li><a href="tel:+79999999999">+7 (999) 999-99-99</a></li>
            <li>г. Караганды, ул. Акай Аксая, 11</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; 2026 Alu-Satu Marketplace. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;
