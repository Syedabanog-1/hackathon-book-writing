import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

const API_URL = 'http://localhost:8000/api/auth';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        setUser({
                            id: userData.id,
                            name: userData.full_name || userData.email.split('@')[0],
                            email: userData.email
                        });
                    } else {
                        localStorage.removeItem('token');
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.access_token;

                if (rememberMe) {
                    localStorage.setItem('token', token);
                } else {
                    // For session-only, we could use sessionStorage, but for simplicity
                    // and better UX we'll use localStorage for now
                    localStorage.setItem('token', token);
                }

                // Get user details
                const userResponse = await fetch(`${API_URL}/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUser({
                        id: userData.id,
                        name: userData.full_name || userData.email.split('@')[0],
                        email: userData.email
                    });
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const signup = async (name: string, email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: name
                }),
            });

            if (response.ok) {
                // Auto login after signup
                return await login(email, password);
            }
            return false;
        } catch (error) {
            console.error('Signup failed:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    const value: AuthContextType = {
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
