import { Link } from "react-router-dom";
import styles from "./Info.module.css";

const Security = () => (
  <div className={styles.page}>
    <div className={styles.breadcrumb}>
      <Link to="/">Главная</Link> / <span>Безопасность</span>
    </div>

    <h1 className={styles.title}>Безопасность</h1>
    <p className={styles.subtitle}>
      Защита ваших данных и денег — наш главный приоритет. Узнайте, как мы
      обеспечиваем безопасность на платформе Alu-Satu.
    </p>

    <div className={styles.section}>
      <h2>Как мы защищаем ваши данные</h2>
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>SSL</div>
          <h3>SSL/TLS шифрование</h3>
          <p>
            Все данные между вашим браузером и нашим сервером передаются
            по защищённому протоколу HTTPS.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>PWD</div>
          <h3>Хеширование паролей</h3>
          <p>
            Пароли хранятся в зашифрованном виде (bcrypt). Даже сотрудники
            компании не имеют доступа к вашему паролю.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>PCI</div>
          <h3>Безопасные платежи</h3>
          <p>
            Данные карт обрабатываются сертифицированными платёжными
            провайдерами (PCI DSS). Мы не храним номера карт.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>24/7</div>
          <h3>Мониторинг</h3>
          <p>
            Круглосуточное наблюдение за подозрительной активностью и
            автоматическая блокировка вредоносных действий.
          </p>
        </div>
      </div>
    </div>

    <div className={styles.section}>
      <h2>Защита покупателей</h2>
      <ul>
        <li>
          <strong>Проверка продавцов</strong> — все продавцы проходят
          верификацию перед размещением товаров.
        </li>
        <li>
          <strong>Гарантия возврата</strong> — если товар не соответствует
          описанию, мы вернём деньги в полном объёме.
        </li>
        <li>
          <strong>Безопасная сделка</strong> — деньги удерживаются на
          эскроу-счёте до подтверждения получения товара покупателем.
        </li>
        <li>
          <strong>Система отзывов</strong> — реальные отзывы помогают
          выбрать надёжного продавца.
        </li>
      </ul>
    </div>

    <div className={styles.section}>
      <h2>Как защитить себя</h2>
      <div className={styles.steps}>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <h4>Используйте надёжный пароль</h4>
            <p>
              Минимум 8 символов, сочетание букв, цифр и специальных
              символов. Не используйте один пароль для нескольких сервисов.
            </p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <h4>Не делитесь данными</h4>
            <p>
              Никогда не сообщайте пароль, SMS-код или данные карты. Наши
              сотрудники никогда не запрашивают эту информацию.
            </p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <h4>Проверяйте URL</h4>
            <p>
              Всегда убеждайтесь, что вы находитесь на alu-satu.com.
              Остерегайтесь фишинговых страниц.
            </p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <h4>Сообщайте о подозрительном</h4>
            <p>
              Если вы заметили подозрительный товар или продавца — нажмите
              «Пожаловаться» или напишите на security@alu-satu.com.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className={styles.section}>
      <h2>Сообщить о проблеме безопасности</h2>
      <p>
        Если вы обнаружили уязвимость или подозрительную активность на
        платформе, незамедлительно сообщите нам:
      </p>
      <div className={styles.contactGrid}>
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}>СЕК</div>
          <h4>Безопасность</h4>
          <p><a href="mailto:security@alu-satu.com">security@alu-satu.com</a></p>
        </div>
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}>@</div>
          <h4>Поддержка</h4>
          <p><a href="mailto:support@alu-satu.com">support@alu-satu.com</a></p>
        </div>
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}>Тел</div>
          <h4>Срочная линия</h4>
          <p><a href="tel:+79999999999">+7 (999) 999-99-99</a></p>
        </div>
      </div>
    </div>
  </div>
);

export default Security;
