import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.error || 'Login Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card animate-appear" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h2 className="gradient-text" style={{ marginBottom: 'var(--spacing-xs)' }}>Welcome Back</h2>
                    <p>Login to continue listening</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(255, 59, 48, 0.1)',
                        border: '1px solid var(--error)',
                        color: 'var(--error)',
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--border-radius-md)',
                        marginBottom: 'var(--spacing-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid" style={{ gap: 'var(--spacing-lg)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? <div className="spin" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : <>
                            <LogIn size={20} />
                            Login
                        </>}
                    </button>
                </form>

                <div className="divider" style={{ textAlign: 'center', position: 'relative', margin: 'var(--spacing-xl) 0' }}>
                    <span style={{ background: 'var(--bg-secondary)', padding: '0 var(--spacing-sm)', position: 'relative', zIndex: 1, color: 'var(--text-secondary)' }}>or continue with</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={handleGoogleLogin} className="btn" style={{
                        width: '100%',
                        background: 'white',
                        color: 'black',
                        justifyContent: 'center',
                        border: '1px solid #dadce0',
                        borderRadius: '20px', // Pill shape
                        padding: '10px 0',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="" style={{ width: '18px', marginRight: '10px' }} />
                        Sign in with Google
                    </button>
                </div>

                <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <p>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
