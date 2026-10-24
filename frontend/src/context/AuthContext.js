import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [plannerProfile, setPlannerProfile] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('tp_token'));
    const [loading, setLoading] = useState(true);
    // Initialize and check saved token
    useEffect(() => {
        async function loadCurrentUser() {
            const savedToken = localStorage.getItem('tp_token');
            if (!savedToken) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${savedToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setPlannerProfile(data.planner_profile || null);
                    setToken(savedToken);
                }
                else {
                    localStorage.removeItem('tp_token');
                    setToken(null);
                    setUser(null);
                    setPlannerProfile(null);
                }
            }
            catch (e) {
                console.error('Failed to restore session', e);
            }
            finally {
                setLoading(false);
            }
        }
        loadCurrentUser();
    }, []);
    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }
            localStorage.setItem('tp_token', data.token);
            setToken(data.token);
            setUser(data.user);
            setPlannerProfile(data.planner_profile || null);
            return { success: true };
        }
        catch (e) {
            return { success: false, error: e.message || 'Connection error' };
        }
    };
    const register = async (formData) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) {
                return { success: false, error: data.error || 'Registration failed' };
            }
            localStorage.setItem('tp_token', data.token);
            setToken(data.token);
            setUser(data.user);
            setPlannerProfile(data.planner_profile || null);
            return { success: true };
        }
        catch (e) {
            return { success: false, error: e.message || 'Connection error' };
        }
    };
    const logout = () => {
        localStorage.removeItem('tp_token');
        setToken(null);
        setUser(null);
        setPlannerProfile(null);
    };
    // Instant demo role switch for effortless testing
    const quickLoginAs = async (role) => {
        let email = 'traveler@example.com';
        let password = 'Traveler@123';
        if (role === 'planner') {
            email = 'ramesh.planner@tripplanner.com';
            password = 'Planner@123';
        }
        else if (role === 'admin') {
            email = 'admin@tripplanner.com';
            password = 'Admin@123';
        }
        await login(email, password);
    };
    const refreshMe = async () => {
        if (!token)
            return;
        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setPlannerProfile(data.planner_profile || null);
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            plannerProfile,
            token,
            loading,
            login,
            register,
            logout,
            quickLoginAs,
            refreshMe,
            setPlannerProfile
        }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
