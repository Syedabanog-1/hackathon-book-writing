import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import styles from '../css/auth.module.css';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';

export default function Signup(): JSX.Element {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const success = await signup(name, email, password);

            if (success) {
                // Redirect to home page
                history.push('/');
            } else {
                setError('An account with this email already exists');
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
                    <div className={styles.authLogo}>🚀</div>
                    <h1 className={styles.authTitle}>Create Account</h1>
                    <p className={styles.authSubtitle}>
                        Start your journey in Physical AI & Robotics
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.formLabel}>
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.formInput}
                            autoComplete="name"
                        />
                    </div>

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
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.formInput}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.formLabel}>
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.formInput}
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className={styles.authLink}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
