import { Link } from "react-router-dom";
import styles from "./Info.module.css";

const About = () => (
  <div className={styles.page}>
    <div className={styles.breadcrumb}>
      <Link to="/">Главная</Link> / <span>О компании</span>
    </div>

    <h1 className={styles.title}>О компании Alu-Satu</h1>
    <p className={styles.subtitle}>
      Крупнейший маркетплейс Казахстана — объединяем продавцов и покупателей
      по всей стране с 2024 года.
    </p>

    <div className={styles.section}>
      <h2>Наша миссия</h2>
      <p>
        Alu-Satu — это современная онлайн-площадка, созданная для того, чтобы
        каждый казахстанец мог легко и безопасно покупать и продавать товары.
        Мы верим, что торговля должна быть доступной, прозрачной и удобной для
        всех участников.
      </p>
      <div className={styles.highlight}>
        <p>
          Наша цель — стать платформой №1 в Центральной Азии, предоставляя
          лучший сервис для покупателей и продавцов.
        </p>
      </div>
    </div>

    <div className={styles.section}>
      <h2>Alu-Satu в цифрах</h2>
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>ТВ</div>
          <h3>50 000+</h3>
          <p>Товаров на площадке от проверенных продавцов</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>ПЛ</div>
          <h3>120 000+</h3>
          <p>Зарегистрированных пользователей по всему Казахстану</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>ДС</div>
          <h3>14 городов</h3>
          <p>Доставка по всем крупным городам страны</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>★</div>
          <h3>4.8 / 5</h3>
          <p>Средняя оценка покупателей</p>
        </div>
      </div>
    </div>

    <div className={styles.section}>
      <h2>История</h2>
      <p>
        Компания была основана в 2024 году в Караганды группой молодых
        предпринимателей, которые хотели создать удобную платформу для
        онлайн-торговли в Казахстане. Название «Alu-Satu» происходит от
        казахского «алу-сату» — «купля-продажа».
      </p>
      <p>
        За первый год работы мы привлекли более 120 тысяч пользователей,
        запустили собственную службу доставки и расширили географию присутствия
        на 14 городов Казахстана.
      </p>
    </div>

    <div className={styles.section}>
      <h2>Наша команда</h2>
      <p>Мы — молодая и амбициозная команда из Караганды.</p>
      <div className={styles.teamGrid}>
        <div className={styles.teamCard}>
          <div className={styles.teamAvatar}>АД</div>
          <h4>Абикенов Диас</h4>
          <p>CEO & Основатель</p>
        </div>
        <div className={styles.teamCard}>
          <div className={styles.teamAvatar}>ПМ</div>
          <h4>Пакизадаев Мади</h4>
          <p>CTO</p>
        </div>
        <div className={styles.teamCard}>
          <div className={styles.teamAvatar}>ЖН</div>
          <h4>Жарылкасынов Нурбек</h4>
          <p>Head of Product</p>
        </div>
      </div>
    </div>

    <div className={styles.section}>
      <h2>Карьера</h2>
      <p>
        Мы всегда ищем талантливых специалистов! Alu-Satu — это место, где вы
        можете расти профессионально, работать с современными технологиями и
        менять рынок e-commerce в Казахстане.
      </p>
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>FE</div>
          <h3>Frontend Developer</h3>
          <p>React, TypeScript, удалённо. Работа над маркетплейсом.</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>DA</div>
          <h3>Data Analyst</h3>
          <p>Python, SQL. Аналитика поведения пользователей.</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>RN</div>
          <h3>Mobile Developer</h3>
          <p>React Native. Разработка мобильного приложения.</p>
        </div>
      </div>
      <p>
        Отправляйте резюме на{" "}
        <a href="mailto:hr@alu-satu.com" style={{ color: "#000", fontWeight: 600 }}>
          hr@alu-satu.com
        </a>
      </p>
    </div>

    <div className={styles.section}>
      <h2>Пресс-центр</h2>
      <p>
        Для запросов СМИ, интервью и комментариев обращайтесь по адресу{" "}
        <a href="mailto:press@alu-satu.com" style={{ color: "#000", fontWeight: 600 }}>
          press@alu-satu.com
        </a>
        . Мы открыты к сотрудничеству с медиа и блогерами.
      </p>
    </div>
  </div>
);

export default About;
