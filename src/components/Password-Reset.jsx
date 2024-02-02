import React, { useState } from 'react';
import { baseURL } from '../store/conf.js';
import axios from 'axios';

const PasswordResetPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const data = { email: email };
            const response = await axios.post(`${window.location.protocol}//${baseURL}/api/reset-password/`, data)
            setMessage(response.data.message);
            setError('');
        } catch (err) {
            setError('Please check your email and try again.');
            setMessage('');
        }
    };

    return (
        <div className="centered-container">
            <div className="PasswordResetPage">
                <h2>Reset Password</h2>
                <form onSubmit={handleResetPassword}>
                    <div className="form-check">
                        <input className="form-control"
                            style={{ width: '100%' }}
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={email}
                            // may want to add form check functionality
                            onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary my-2">Reset Password</button>
                </form>
                {message && <alert color="success">{message}</alert>}
                {error && <alert color="danger">{error}</alert>}
            </div>
        </div>
    );
};

export default PasswordResetPage;