import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useModal } from '../../context/ModalContext';

const Register = () => {
    const { showAlert } = useModal();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
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
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            // Registration successful, usually redirect to login or show success message
            // API returns 201 with message.
            showAlert(res.data.message, 'success', 'Registration Successful');
            navigate('/login');
        } catch (err) {
            console.error("Registration Error:", err);
            setError(err.response?.data?.error || 'Registration Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card animate-appear" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h2 className="gradient-text" style={{ marginBottom: 'var(--spacing-xs)' }}>Create Account</h2>
                    <p>Join MyTune today</p>
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
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

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

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? <div className="spin" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : <>
                            <UserPlus size={20} />
                            Sign Up
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
                        borderRadius: '20px',
                        padding: '10px 0',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="" style={{ width: '18px', marginRight: '10px' }} />
                        Sign up with Google
                    </button>
                </div>

                <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <p>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
