import React, { useState } from "react";
import styles from "./Sell.module.css";
import { createListedProduct } from "../../api/users.api";
import { useAuth } from "../../store";

const categories = ["Телефоны", "Ноутбуки", "Одежда", "Обувь", "Часы", "Сумки", "Аксессуары", "Электроника", "Дом и сад"];

const generateRouteId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {

  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const Sell = () => {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Телефоны");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== files.length) {
      setMsgType("error");
      setMsg("Некорректные файлы: только изображения до 5 МБ");
      return;
    }
    setImageFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setImages((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      setMsgType("error");
      setMsg("Пожалуйста, введите название и цену.");
      return;
    }
    if (!images.length) {
      setMsgType("error");
      setMsg("Добавьте хотя бы одно фото товара.");
      return;
    }
    if (!token) {
      setMsgType("error");
      setMsg("Войдите в аккаунт, чтобы опубликовать объявление.");
      return;
    }
    try {
      let product;

      if (token) {

        try {
          product = await createListedProduct({
            title,
            price: +price,
            category,
            description,
            images, 
          });
        } catch (err) {
          console.error("API create failed", err);
          throw err;
        }
      }

      if (!product) throw new Error("No product returned from API");

      setMsgType("success");
      setMsg("Товар успешно опубликован!");
      setTitle(""); 
      setPrice(""); 
      setCategory("Телефоны"); 
      setDescription(""); 
      setImage("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      window.dispatchEvent(new CustomEvent("myproducts:changed"));
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setMsgType("error");
      setMsg("Ошибка при добавлении товара.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Продайте свой товар</h1>
        <p className={styles.subtitle}>Быстро и просто разместите объявление</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Название товара <span className={styles.required}>*</span>
          </label>
          <input 
            id="title"
            type="text" 
            placeholder="Например: iPhone 13 Pro" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.label}>
              Цена (₸) <span className={styles.required}>*</span>
            </label>
            <input 
              id="price"
              type="number" 
              placeholder="0" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Категория
            </label>
            <select 
              id="category"
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className={styles.select}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Фото товара <span className={styles.required}>*</span>
          </label>
          <div className={styles.uploadRow}>
            <label
              className={styles.uploadBtn}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
                <path d="M16.5 19.5H7.5C5.01472 19.5 3 17.4853 3 15V9C3 6.51472 5.01472 4.5 7.5 4.5H8.37868C8.74456 4.5 9.09763 4.63214 9.36612 4.86612L10.6339 5.93388C10.9024 6.16786 11.2554 6.3 11.6213 6.3H16.5C18.9853 6.3 21 8.31472 21 10.8V15C21 17.4853 18.9853 19.5 16.5 19.5Z" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>Загрузить фото</span>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
            <span className={styles.uploadRowHint}>
              Можно выбрать несколько файлов
            </span>
          </div>
          <div className={styles.thumbGrid}>
            {images.map((img, idx) => (
              <div key={idx} className={styles.thumbItem}>
                <img
                  src={img}
                  alt={`preview-${idx}`}
                  className={styles.thumbImg}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className={styles.thumbRemove}
                  aria-label="Удалить изображение"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Описание
          </label>
          <textarea 
            id="description"
            placeholder="Расскажите подробнее о товаре..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            rows="6"
          />
        </div>

        <button type="submit" className={styles.submitBtn}>
          Опубликовать товар
        </button>
      </form>

      {msg && (
        <div className={`${styles.message} ${styles[msgType]}`}>
          {msg}
        </div>
      )}
    </div>
  );
};

export default Sell;
