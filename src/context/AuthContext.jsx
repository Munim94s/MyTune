import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Auto-login: Check token in localStorage
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            // Ideally verify token with backend here, 
            // but for "auto-login" speed, trusting local storage + handling 401s later is common.
        } else if (token) {
            // If token exists but no user (e.g. from a fresh OAuth redirect not yet processed), attempt fetch?
            // Actually, the main auth flows (Login page, OAuth callback) set both.
        }

        // Handle URL query params for OAuth redirect (e.g. /?token=...&user=...)
        // This runs once on mount.
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        const urlUser = params.get('user');

        if (urlToken && urlUser) {
            const parsedUser = JSON.parse(decodeURIComponent(urlUser));
            localStorage.setItem('token', urlToken);
            localStorage.setItem('user', JSON.stringify(parsedUser));
            setUser(parsedUser);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        setLoading(false);
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
