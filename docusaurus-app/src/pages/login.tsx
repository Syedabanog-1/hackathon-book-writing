import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import styles from '../css/auth.module.css';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';

export default function Login(): JSX.Element {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const success = await login(email, password, rememberMe);

            if (success) {
                // Redirect to home page
                history.push('/');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <div className={styles.authLogo}>🤖</div>
                    <h1 className={styles.authTitle}>Welcome Back</h1>
                    <p className={styles.authSubtitle}>
                        Sign in to continue your Physical AI journey
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.formInput}
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.formLabel}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.formInput}
                            autoComplete="current-password"
                        />
                    </div>

                    <div className={styles.checkboxGroup}>
                        <input
                            id="remember"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className={styles.checkbox}
                        />
                        <label htmlFor="remember" className={styles.checkboxLabel}>
                            Remember me
                        </label>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <p>
                        Don't have an account?{' '}
                        <Link to="/signup" className={styles.authLink}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
