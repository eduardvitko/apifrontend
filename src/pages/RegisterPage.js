import React, { useState } from 'react';
import { registerUser } from '../api';

function RegisterPage() {
    const [form, setForm] = useState({ username: '', password: '', phone: '' });
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(false);
        try {
            const res = await registerUser(form);
            setMessage(res.data);
            setSuccess(true);
        } catch (err) {
            if (err.response?.data) {
                setMessage(err.response.data);
            } else {
                setMessage('Registration failed');
            }
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '500px' }}>
            <h2 className="mb-4 text-center">Register</h2>
            {message && (
                <div className={`alert ${success ? 'alert-success' : 'alert-danger'}`} role="alert">
                    {message}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Username</label>
                    <input className="form-control" name="username" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Phone</label>
                    <input className="form-control" name="phone" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input className="form-control" type="password" name="password" onChange={handleChange} required />
                </div>
                <button className="btn btn-primary w-100" type="submit">Register</button>
            </form>
        </div>
    );
}

export default RegisterPage;
