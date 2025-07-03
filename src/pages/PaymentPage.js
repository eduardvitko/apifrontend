import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // Додаємо useLocation для отримання стану маршруту

// Базові URL-адреси для ваших API
const API_PAYMENTS_URL = 'http://localhost:8080/api/payments';
const API_ORDERS_URL = 'http://localhost:8080/api/orders'; // Припускаємо, що у вас є API для замовлень

const PaymentPage = () => {
    const [payments, setPayments] = useState([]);
    const [orders, setOrders] = useState([]); // Для випадаючого списку замовлень
    const [selectedPayment, setSelectedPayment] = useState(null); // Для редагування
    const [formData, setFormData] = useState({
        orderId: '',
        paymentDate: '',
        amount: '',
        method: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // Для повідомлень про успіх/помилку

    // Ref для прокрутки до форми
    const formRef = React.useRef(null);
    const location = useLocation(); // Отримуємо об'єкт location для доступу до стану маршруту

    // Отримання JWT-токена з localStorage
    const getToken = () => localStorage.getItem('jwt');

    // Заголовки для автентифікованих запитів
    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        // Функція для завантаження всіх даних
        const loadAllData = async () => {
            setLoading(true);
            setError('');
            setMessage('');
            const token = getToken();

            if (!token) {
                setError('Будь ласка, увійдіть, щоб керувати платежами. Токен JWT відсутній.');
                setLoading(false);
                return;
            }

            try {
                // Завантаження платежів
                const paymentsRes = await axios.get(API_PAYMENTS_URL, getAuthHeaders());
                setPayments(paymentsRes.data);

                // Завантаження замовлень для випадаючого списку та для кнопки "Сплатити"
                // Припускаємо, що /api/orders/all доступний або захищений відповідним чином
                // Також припускаємо, що об'єкти замовлень містять поля 'id', 'total' та 'status'.
                const ordersRes = await axios.get(`${API_ORDERS_URL}/all`, getAuthHeaders());
                setOrders(ordersRes.data);

            } catch (err) {
                console.error('Помилка завантаження даних:', err);
                if (err.response) {
                    if (err.response.status === 401 || err.response.status === 403) {
                        setError('Неавторизований доступ. Переконайтеся, що ви увійшли як адміністратор.');
                    } else {
                        setError(`Помилка: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
                    }
                } else {
                    setError('Помилка мережі або сервера. Будь ласка, спробуйте пізніше.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadAllData();

        // Логіка для попереднього заповнення форми, якщо дані передано через state з useLocation
        if (location.state && location.state.orderId) {
            const { orderId, amount } = location.state;
            setFormData(prev => ({
                ...prev,
                orderId: orderId.toString(),
                amount: amount ? amount.toFixed(2).toString() : '', // Форматуємо суму
                paymentDate: '', // Скидаємо дату, щоб користувач міг вибрати або залишити за замовчуванням
                method: '' // Скидаємо метод, щоб користувач вибрав
            }));
            // Прокручуємо до форми, якщо дані прийшли зі стану маршруту
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Очищаємо стан маршруту після використання, щоб уникнути повторного заповнення при оновленні сторінки
            // navigate(location.pathname, { replace: true, state: {} }); // Це може бути корисно, але може скинути інші стани
        }

    }, [location.state]); // Додаємо location.state до залежностей useEffect, щоб реагувати на зміни стану маршруту

    // Обробник змін у формі
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Обробник створення нового платежу
    const handleCreatePayment = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const token = getToken();
        if (!token) {
            setError('Токен JWT відсутній. Будь ласка, увійдіть.');
            return;
        }

        try {
            // Перетворення amount на число, orderId на Integer
            const dataToSend = {
                ...formData,
                orderId: parseInt(formData.orderId, 10),
                amount: parseFloat(formData.amount),
                // Метод повинен бути у верхньому регістрі, як у вашому ENUM
                method: formData.method.toUpperCase(),
                // Якщо paymentDate не встановлено, бекенд використає CURRENT_TIMESTAMP
                paymentDate: formData.paymentDate ? formData.paymentDate : null
            };

            const res = await axios.post(API_PAYMENTS_URL, dataToSend, getAuthHeaders());
            setPayments(prev => [...prev, res.data]);
            setMessage('Платіж успішно створено!');
            setFormData({ orderId: '', paymentDate: '', amount: '', method: '' }); // Очистити форму
        } catch (err) {
            console.error('Помилка створення платежу:', err);
            if (err.response) {
                setError(`Помилка створення: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
            } else {
                setError('Помилка мережі або сервера при створенні платежу.');
            }
        }
    };

    // Обробник переходу в режим редагування
    const handleEditClick = (payment) => {
        setSelectedPayment(payment);
        setFormData({
            orderId: payment.orderId.toString(), // Перетворюємо на рядок для input/select
            paymentDate: payment.paymentDate ? payment.paymentDate.substring(0, 16) : '', // Форматуємо для datetime-local
            amount: payment.amount.toString(),
            method: payment.method
        });
        // Прокрутка до форми при редагуванні
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Обробник оновлення платежу
    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!selectedPayment) return;

        const token = getToken();
        if (!token) {
            setError('Токен JWT відсутній. Будь ласка, увійдіть.');
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                id: selectedPayment.id, // ID для DTO
                orderId: parseInt(formData.orderId, 10),
                amount: parseFloat(formData.amount),
                method: formData.method.toUpperCase(),
                paymentDate: formData.paymentDate ? formData.paymentDate : null
            };

            const res = await axios.put(`${API_PAYMENTS_URL}/${selectedPayment.id}`, dataToSend, getAuthHeaders());
            setPayments(prev => prev.map(p => (p.id === selectedPayment.id ? res.data : p)));
            setMessage('Платіж успішно оновлено!');
            setSelectedPayment(null); // Вийти з режиму редагування
            setFormData({ orderId: '', paymentDate: '', amount: '', method: '' }); // Очистити форму
        } catch (err) {
            console.error('Помилка оновлення платежу:', err);
            if (err.response) {
                setError(`Помилка оновлення: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
            } else {
                setError('Помилка мережі або сервера при оновленні платежу.');
            }
        }
    };

    // Обробник видалення платежу
    const handleDeletePayment = async (id) => {
        setError('');
        setMessage('');

        const token = getToken();
        if (!token) {
            setError('Токен JWT відсутній. Будь ласка, увійдіть.');
            return;
        }

        if (window.confirm('Ви впевнені, що хочете видалити цей платіж?')) {
            try {
                await axios.delete(`${API_PAYMENTS_URL}/${id}`, getAuthHeaders());
                setPayments(prev => prev.filter(p => p.id !== id));
                setMessage('Платіж успішно видалено!');
            } catch (err) {
                console.error('Помилка видалення платежу:', err);
                if (err.response) {
                    setError(`Помилка видалення: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
                } else {
                    setError('Помилка мережі або сервера при видаленні платежу.');
                }
            }
        }
    };

    // Новий обробник для кнопки "Сплатити за замовлення"
    const handlePayForOrderClick = (orderId, orderTotal) => {
        setSelectedPayment(null); // Переконатися, що ми створюємо новий платіж
        setFormData({
            orderId: orderId.toString(),
            paymentDate: '', // Дозволити бекенду встановити за замовчуванням або користувачеві вибрати
            amount: orderTotal ? orderTotal.toFixed(2).toString() : '', // Попередньо заповнити суму, якщо вона є
            method: '' // Користувач повинен вибрати метод
        });
        // Прокрутка до форми
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Фільтруємо замовлення, які очікують оплати (припускаємо, що статус 'PENDING' означає неоплачений)
    const unpaidOrders = orders.filter(order => order.status === 'PENDING');


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-700">Завантаження даних...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 font-sans antialiased">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        Управління платежами
                    </span>
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mb-6 shadow-md" role="alert">
                        <strong className="font-bold">Помилка! </strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}
                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg relative mb-6 shadow-md" role="alert">
                        <strong className="font-bold">Успіх! </strong>
                        <span className="block sm:inline"> {message}</span>
                    </div>
                )}

                {/* Розділ для замовлень, що очікують оплати */}
                <div className="mb-12 p-8 border border-blue-200 rounded-xl bg-blue-50 shadow-lg">
                    <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">Замовлення, що очікують оплати</h2>
                    {unpaidOrders.length === 0 ? (
                        <p className="text-center text-gray-600 text-lg">Наразі немає замовлень, що очікують оплати. Чудова робота!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {unpaidOrders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform transition duration-300 hover:scale-105 hover:shadow-lg">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Замовлення #{order.id}</h3>
                                    <p className="text-gray-700 mb-2">Сума: <span className="font-bold text-green-600 text-lg">{order.total ? order.total.toFixed(2) : 'N/A'} ₴</span></p>
                                    <p className="text-gray-700 mb-4">Статус: <span className="font-medium text-yellow-600">{order.status}</span></p>
                                    <button
                                        onClick={() => handlePayForOrderClick(order.id, order.total)}
                                        className="mt-3 w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition duration-300 transform hover:-translate-y-0.5"
                                    >
                                        Сплатити
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Форма створення/редагування платежів */}
                <div ref={formRef} className="mb-12 p-8 border border-purple-200 rounded-xl bg-purple-50 shadow-lg">
                    <h2 className="text-3xl font-bold text-purple-800 mb-8 text-center">
                        {selectedPayment ? 'Редагувати платіж' : 'Створити новий платіж'}
                    </h2>
                    <form onSubmit={selectedPayment ? handleUpdatePayment : handleCreatePayment} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label htmlFor="orderId" className="block text-gray-700 text-lg font-semibold mb-2">Замовлення:</label>
                            <select
                                id="orderId"
                                name="orderId"
                                value={formData.orderId}
                                onChange={handleInputChange}
                                required
                                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                            >
                                <option value="">Виберіть замовлення</option>
                                {orders.map(order => (
                                    <option key={order.id} value={order.id}>
                                        Замовлення #{order.id} {order.description ? ` - ${order.description}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-gray-700 text-lg font-semibold mb-2">Сума:</label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                step="0.01"
                                required
                                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="method" className="block text-gray-700 text-lg font-semibold mb-2">Метод оплати:</label>
                            <select
                                id="method"
                                name="method"
                                value={formData.method}
                                onChange={handleInputChange}
                                required
                                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                            >
                                <option value="">Виберіть метод</option>
                                <option value="CREDIT_CARD">Кредитна картка</option>
                                <option value="PAYPAL">PayPal</option>
                                <option value="BANK_TRANSFER">Банківський переказ</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="paymentDate" className="block text-gray-700 text-lg font-semibold mb-2">Дата платежу (необов'язково):</label>
                            <input
                                type="datetime-local"
                                id="paymentDate"
                                name="paymentDate"
                                value={formData.paymentDate}
                                onChange={handleInputChange}
                                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                            />
                        </div>
                        <div className="md:col-span-2 flex flex-col sm:flex-row justify-center gap-4 mt-6">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 transform hover:-translate-y-0.5 text-lg"
                            >
                                {selectedPayment ? 'Оновити платіж' : 'Створити платіж'}
                            </button>
                            {selectedPayment && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedPayment(null);
                                        setFormData({ orderId: '', paymentDate: '', amount: '', method: '' });
                                    }}
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 transition duration-300 transform hover:-translate-y-0.5 text-lg"
                                >
                                    Скасувати
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Список платежів */}
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Існуючі платежі</h2>
                {payments.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg">Платежів не знайдено.</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Замовлення ID</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Дата платежу</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Сума</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Метод</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Дії</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {payments.map(payment => (
                                <tr key={payment.id} className="hover:bg-blue-50 transition duration-150 ease-in-out">
                                    <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{payment.orderId}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{payment.amount.toFixed(2)} ₴</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{payment.method}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-sm flex gap-3">
                                        <button
                                            onClick={() => handleEditClick(payment)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium shadow-sm transition duration-200 transform hover:-translate-y-0.5"
                                        >
                                            Редагувати
                                        </button>
                                        <button
                                            onClick={() => handleDeletePayment(payment.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium shadow-sm transition duration-200 transform hover:-translate-y-0.5"
                                        >
                                            Видалити
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
