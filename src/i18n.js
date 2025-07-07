import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Опціонально: автоматичне визначення мови браузера
import LanguageDetector from 'i18next-browser-languagedetector';

// Переклади для UA та EN
const resources = {
    en: {
        translation: {
            welcome: "Welcome",
            login: "Login",
            logout: "Logout",
            register: "register",
            profile: "profile",
            search:"search",
            categories:"categories",
            Login:"Login",
            Password:"password",
            Sign_in:"sign in",

    "login_title": "Login",
    "login_error": "❌ Invalid username or password.",
    "login_username": "Username",
    "login_password": "Password",
    "login_loading": "Logging in...",
    "login_button": "Login",

    "reg_title": "Register",
    "reg_field_username": "Username",
    "reg_field_phone": "Phone",
    "reg_field_password": "Password",
    "reg_button": "Register",
    "reg_success": "✅ Registration successful!",
    "reg_fail": "Registration failed",
    "reg_server_error": "⚠️ Server connection error",
    "reg_form_error": "Form contains errors:",
    "reg_error_username": "must contain only letters (Ukr/Eng)",
    "reg_error_phone": "must contain only digits and may start with +",


            "home_welcome": "Welcome to the store!",
            "home_select_category": "Choose a category or log into your profile.",



            "profile_title": "User Profile",
            "profile_username": "Username",
            "profile_phone": "Phone",
            "profile_roles": "Roles",
            "profile_orders": "My Orders",
            "profile_admin_panel": "Admin Panel",
            "profile_logout": "Logout",
            "profile_unauthorized": "You are not authorized",
            "profile_load_error": "Failed to load profile",
            "profile_loading": "Loading profile...",

            "categories_load_error": "Failed to load categories",
            "select_category": "Choose a category",
            "view_products": "View products",
            "loading": "Loading...",
            "back": "Back"




}
    },
    ua: {
        translation: {
            welcome: "ласкаво просимо",
            login: "увійти",
            logout: "вийти",
            register: "реєстрація",
            profile: "профіль",
            search:"пошук",
            categories:"категорії",
            Login: "увійти",
            Password:"пароль",
            Sign_in:"Вхід до облікового запису",

    "login_title": "Вхід",
    "login_error": "❌ Невірний логін або пароль.",
    "login_username": "Логін",
    "login_password": "Пароль",
    "login_loading": "Вхід...",
    "login_button": "Увійти",

    "reg_title": "Реєстрація",
    "reg_field_username": "Ім’я користувача",
    "reg_field_phone": "Телефон",
    "reg_field_password": "Пароль",
    "reg_button": "Зареєструватися",
    "reg_success": "✅ Реєстрація пройшла успішно!",
    "reg_fail": "Помилка реєстрації",
    "reg_server_error": "⚠️ Помилка з’єднання із сервером",
    "reg_form_error": "Форма містить помилки:",
    "reg_error_username": "має містити лише літери (укр/англ)",
    "reg_error_phone": "має містити лише цифри і може починатись з +",
            "home_welcome": "Ласкаво просимо до магазину!",
            "home_select_category": "Оберіть категорію або увійдіть у свій профіль.",


            "profile_title": "Профіль користувача",
            "profile_username": "Ім'я користувача",
            "profile_phone": "Телефон",
            "profile_roles": "Ролі",
            "profile_orders": "Мої замовлення",
            "profile_admin_panel": "Адмін панель",
            "profile_logout": "Вийти",
            "profile_unauthorized": "Ви не авторизовані",
            "profile_load_error": "Не вдалося завантажити профіль",
            "profile_loading": "Завантаження профілю...",



    "categories_load_error": "Не вдалося завантажити категорії",
    "select_category": "Обирай категорію",
    "view_products": "Переглянути товари",
    "loading": "Завантаження...",
    "back": "Назад"




}
    }
};


i18n
    .use(LanguageDetector) // Визначає мову браузера, можна не використовувати, якщо хочеш фіксувати
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'ua',  // мова за замовчуванням
        interpolation: {
            escapeValue: false, // React екранує сам
        }
    });

export default i18n;
