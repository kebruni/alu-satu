import { Link } from "react-router-dom";
import styles from "./Info.module.css";

const Help = () => (
  <div className={styles.page}>
    <div className={styles.breadcrumb}>
      <Link to="/">Главная</Link> / <span>Помощь и поддержка</span>
    </div>

    <h1 className={styles.title}>Центр помощи</h1>
    <p className={styles.subtitle}>
      Ответы на популярные вопросы и подробные инструкции по работе с
      Alu-Satu Marketplace.
    </p>
    <div className={styles.section} id="how-to-buy">
      <h2>Как купить</h2>
      <p>Покупать на Alu-Satu просто — следуйте этим шагам:</p>
      <div className={styles.steps}>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <h4>Найдите товар</h4>
            <p>
              Используйте поиск или каталог для выбора нужного товара.
              Фильтруйте по цене, категории и другим параметрам.
            </p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <h4>Добавьте в корзину</h4>
            <p>
              Нажмите кнопку «В корзину» на карточке товара. Вы можете
              добавить несколько товаров и оформить всё одним заказом.
            </p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <h4>Оформите заказ</h4>
            <p>
              Перейдите в корзину, проверьте состав заказа и нажмите
              «Оформить заказ». Укажите адрес доставки и выберите способ
              оплаты.
            </p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <h4>Получите товар</h4>
            <p>
              Дождитесь доставки курьером или заберите самовывозом из
              пункта выдачи в вашем городе. Срок доставки — 1–5 рабочих
              дней.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className={styles.section} id="how-to-sell">
      <h2>Как продать</h2>
      <p>Хотите заработать? Продавать на Alu-Satu может каждый:</p>
      <div className={styles.steps}>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <h4>Зарегистрируйтесь</h4>
            <p>
              Создайте аккаунт на Alu-Satu. Регистрация бесплатная и
              занимает 2 минуты.
            </p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <h4>Разместите объявление</h4>
            <p>
              Перейдите на страницу «Продать», заполните название, описание,
              укажите цену и загрузите фотографии товара.
            </p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <h4>Дождитесь покупателя</h4>
            <p>
              Ваш товар появится в каталоге. Покупатели смогут найти его
              через поиск и категории.
            </p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <h4>Отправьте товар</h4>
            <p>
              После оформления заказа отправьте товар покупателю через нашу
              службу доставки или передайте лично.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className={styles.section} id="delivery">
      <h2>Доставка и возврат</h2>
      <h3>Доставка</h3>
      <ul>
        <li>Доставка по Караганды — 1–2 рабочих дня</li>
        <li>Доставка по Казахстану — 3–5 рабочих дней</li>
        <li>Бесплатная доставка при заказе от 15 000 ₸</li>
        <li>Стоимость стандартной доставки — от 1 500 ₸</li>
        <li>Экспресс-доставка (в тот же день) — 3 000 ₸ (только Караганды)</li>
      </ul>

      <h3>Возврат товара</h3>
      <ul>
        <li>Возврат возможен в течение 14 дней с момента получения</li>
        <li>Товар должен быть в оригинальной упаковке, без следов использования</li>
        <li>Для оформления возврата свяжитесь с поддержкой: support@alu-satu.com</li>
        <li>Возврат денежных средств — в течение 5 рабочих дней после проверки</li>
        <li>Товары из категории «Нижнее бельё» и «Гигиена» возврату не подлежат</li>
      </ul>
    </div>
    <div className={styles.section} id="find-order">
      <h2>Найти заказ</h2>
      <p>
        Чтобы найти информацию о вашем заказе, перейдите в{" "}
        <Link to="/profile" style={{ color: "#000", fontWeight: 600 }}>
          Личный кабинет
        </Link>{" "}
        → вкладка «Мои заказы». Там вы увидите все ваши заказы с деталями:
        дата, состав, сумма и статус.
      </p>
      <div className={styles.highlight}>
        <p>
          Совет: если вы оформляли заказ без авторизации, свяжитесь с
          поддержкой по адресу support@alu-satu.com, указав дату заказа и
          имя получателя.
        </p>
      </div>
    </div>
    <div className={styles.section}>
      <h2>Часто задаваемые вопросы</h2>
      <h3>Как изменить адрес доставки?</h3>
      <p>
        Свяжитесь с поддержкой в течение 2 часов после оформления заказа.
        После передачи заказа курьеру изменение адреса невозможно.
      </p>

      <h3>Как связаться с продавцом?</h3>
      <p>
        На странице товара нажмите «Связаться с продавцом». Вы также можете
        оставить вопрос в отзывах к товару.
      </p>

      <h3>Безопасно ли покупать на Alu-Satu?</h3>
      <p>
        Да! Мы используем защищённое соединение (SSL/TLS) для всех операций.
        Данные ваших карт не хранятся на наших серверах. Подробнее —{" "}
        <Link to="/security" style={{ color: "#000", fontWeight: 600 }}>
          Безопасность
        </Link>
        .
      </p>

      <h3>Как удалить аккаунт?</h3>
      <p>
        Напишите на support@alu-satu.com с темой «Удаление аккаунта».
        Мы обработаем запрос в течение 3 рабочих дней.
      </p>
    </div>
    <div className={styles.section}>
      <h2>Контакты поддержки</h2>
      <div className={styles.contactGrid}>
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}>@</div>
          <h4>Email</h4>
          <p><a href="mailto:support@alu-satu.com">support@alu-satu.com</a></p>
        </div>
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}>Тел</div>
          <h4>Телефон</h4>
          <p><a href="tel:+79999999999">+7 (999) 999-99-99</a></p>
        </div>
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}>TG</div>
          <h4>Telegram</h4>
          <p><a href="https://t.me/akaiaksai" target="_blank" rel="noreferrer">@akaiaksai</a></p>
        </div>
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}>Пн</div>
          <h4>Время работы</h4>
          <p>Пн–Пт: 09:00–18:00</p>
        </div>
      </div>
    </div>
  </div>
);

export default Help;
