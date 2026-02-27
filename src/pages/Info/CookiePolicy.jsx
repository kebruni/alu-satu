import { Link } from "react-router-dom";
import styles from "./Info.module.css";

const CookiePolicy = () => (
  <div className={styles.page}>
    <div className={styles.breadcrumb}>
      <Link to="/">Главная</Link> / <span>Политика cookies</span>
    </div>

    <h1 className={styles.title}>Политика cookies</h1>
    <div className={styles.updated}>Последнее обновление: 1 января 2026</div>

    <div className={styles.section}>
      <h2>Что такое cookies?</h2>
      <p>
        Cookies (куки) — это небольшие текстовые файлы, которые сохраняются
        на вашем устройстве при посещении веб-сайта. Они помогают нам
        обеспечить корректную работу сайта, запомнить ваши предпочтения и
        улучшить пользовательский опыт.
      </p>
    </div>

    <div className={styles.section}>
      <h2>Какие cookies мы используем</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Тип</th>
            <th>Назначение</th>
            <th>Срок хранения</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Необходимые</strong></td>
            <td>Авторизация, корзина, безопасность. Без них сайт не работает.</td>
            <td>Сессия / 30 дней</td>
          </tr>
          <tr>
            <td><strong>Функциональные</strong></td>
            <td>Запоминание языка, региона, предпочтений отображения.</td>
            <td>1 год</td>
          </tr>
          <tr>
            <td><strong>Аналитические</strong></td>
            <td>Сбор статистики посещений, популярных страниц, источников трафика.</td>
            <td>2 года</td>
          </tr>
          <tr>
            <td><strong>Маркетинговые</strong></td>
            <td>Персонализация рекламы, ретаргетинг, отслеживание конверсий.</td>
            <td>90 дней</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className={styles.section}>
      <h2>Сторонние cookies</h2>
      <p>Мы используем cookies от следующих сервисов:</p>
      <ul>
        <li><strong>Google Analytics</strong> — аналитика посещений и поведения пользователей</li>
        <li><strong>Yandex.Metrica</strong> — веб-аналитика и карта кликов</li>
        <li><strong>Facebook Pixel</strong> — отслеживание конверсий из рекламы</li>
        <li><strong>Kaspi</strong> — обработка платежей через Kaspi QR</li>
      </ul>
    </div>

    <div className={styles.section}>
      <h2>Как управлять cookies</h2>
      <p>
        Вы можете управлять cookies через настройки браузера:
      </p>
      <ul>
        <li>
          <strong>Chrome:</strong> Настройки → Конфиденциальность и безопасность →
          Файлы cookie
        </li>
        <li>
          <strong>Firefox:</strong> Настройки → Приватность и защита → Куки и
          данные сайтов
        </li>
        <li>
          <strong>Safari:</strong> Настройки → Конфиденциальность → Управление
          данными веб-сайтов
        </li>
        <li>
          <strong>Edge:</strong> Настройки → Файлы cookie и разрешения сайтов
        </li>
      </ul>
      <div className={styles.highlight}>
        <p>
          Важно! Отключение необходимых cookies может привести к некорректной
          работе сайта (например, невозможность авторизации или работы
          корзины).
        </p>
      </div>
    </div>

    <div className={styles.section}>
      <h2>LocalStorage</h2>
      <p>
        Помимо cookies, мы используем localStorage браузера для хранения
        данных авторизации, содержимого корзины и избранных товаров. Эти
        данные хранятся локально на вашем устройстве и не передаются на
        сервер.
      </p>
    </div>

    <div className={styles.section}>
      <h2>Контакты</h2>
      <p>
        Если у вас есть вопросы по использованию cookies, свяжитесь с нами:
      </p>
      <ul>
        <li>Email: privacy@alu-satu.com</li>
        <li>Телефон: +7 (999) 999-99-99</li>
      </ul>
    </div>
  </div>
);

export default CookiePolicy;
