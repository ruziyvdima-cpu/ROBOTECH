import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  uz: {
    translation: {
      nav: {
        products: "Mahsulotlar",
        cart: "Savat",
        admin: "Admin",
        login: "Kirish",
        logout: "Chiqish"
      },
      common: {
        search: "Qidirish",
        buy: "Sotib olish",
        addToCart: "Savatga qo'shish",
        removeFromCart: "O'chirish",
        checkout: "Rasmiylashtirish",
        total: "Jami",
        emptyCart: "Savatingiz bo'sh",
        save: "Saqlash",
        delete: "O'chirish",
        edit: "Tahrirlash",
        cancel: "Bekor qilish",
        back: "Orqaga"
      },
      checkout: {
        title: "Buyurtmani rasmiylashtirish",
        phone: "Telefon raqami",
        country: "Davlat",
        city: "Shahar",
        address: "Manzil",
        placeholderAddress: "Ko'cha, uy, kvartira...",
        complete: "Buyurtmani yakunlash",
        success: "Buyurtma qabul qilindi!"
      },
      admin: {
        title: "Admin paneli",
        addProduct: "Yangi mahsulot qo'shish",
        editProduct: "Mahsulotni tahrirlash",
        nameUz: "Nomi (UZB)",
        nameEn: "Nomi (ENG)",
        nameRu: "Nomi (RUS)",
        descUz: "Tavsifi (UZB)",
        descEn: "Tavsifi (ENG)",
        descRu: "Tavsifi (RUS)",
        price: "Narxi ($)",
        stock: "Soni",
        image: "Rasm URL",
        category: "Kategoriya"
      }
    }
  },
  en: {
    translation: {
      nav: {
        products: "Products",
        cart: "Cart",
        admin: "Admin",
        login: "Login",
        logout: "Logout"
      },
      common: {
        search: "Search",
        buy: "Buy Now",
        addToCart: "Add to Cart",
        removeFromCart: "Remove",
        checkout: "Checkout",
        total: "Total",
        emptyCart: "Your cart is empty",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        cancel: "Cancel",
        back: "Back"
      },
      checkout: {
        title: "Checkout",
        phone: "Phone Number",
        country: "Country",
        city: "City",
        address: "Address",
        placeholderAddress: "Street, building, apartment...",
        complete: "Complete Order",
        success: "Order completed successfully!"
      },
      admin: {
        title: "Admin Panel",
        addProduct: "Add New Product",
        editProduct: "Edit Product",
        nameUz: "Name (UZB)",
        nameEn: "Name (ENG)",
        nameRu: "Name (RUS)",
        descUz: "Description (UZB)",
        descEn: "Description (ENG)",
        descRu: "Description (RUS)",
        price: "Price ($)",
        stock: "Stock",
        image: "Image URL",
        category: "Category"
      }
    }
  },
  ru: {
    translation: {
      nav: {
        products: "Товары",
        cart: "Корзина",
        admin: "Админ",
        login: "Войти",
        logout: "Выйти"
      },
      common: {
        search: "Поиск",
        buy: "Купить",
        addToCart: "В корзину",
        removeFromCart: "Удалить",
        checkout: "Оформить",
        total: "Итого",
        emptyCart: "Корзина пуста",
        save: "Сохранить",
        delete: "Удалить",
        edit: "Редактировать",
        cancel: "Отмена",
        back: "Назад"
      },
      checkout: {
        title: "Оформление заказа",
        phone: "Номер телефона",
        country: "Страна",
        city: "Город",
        address: "Адрес",
        placeholderAddress: "Улица, дом, квартира...",
        complete: "Завершить заказ",
        success: "Заказ успешно оформлен!"
      },
      admin: {
        title: "Админ панель",
        addProduct: "Добавить товар",
        editProduct: "Редактировать товар",
        nameUz: "Название (UZB)",
        nameEn: "Название (ENG)",
        nameRu: "Название (RUS)",
        descUz: "Описание (UZB)",
        descEn: "Описание (ENG)",
        descRu: "Описание (RUS)",
        price: "Цена ($)",
        stock: "Кол-во",
        image: "URL картинки",
        category: "Категория"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
