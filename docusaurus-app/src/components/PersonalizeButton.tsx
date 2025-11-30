import React, { useState } from 'react';
import styles from './PersonalizeButton.module.css';
import { useAuth } from './AuthContext';

const PersonalizeButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);
    const { isAuthenticated, user } = useAuth();

    const handlePersonalize = async () => {
        if (!isAuthenticated) {
            alert("Please log in to use personalization features.");
            return;
        }

        setIsOpen(true);
        setLoading(true);

        // Get main content text (simple heuristic for Docusaurus docs)
        const mainContent = document.querySelector('article')?.innerText || document.body.innerText;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/personalize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: mainContent.substring(0, 3000) // Limit content length for demo
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPersonalizedContent(data.personalized_content);
            } else {
                setPersonalizedContent("Failed to personalize content. Please try again.");
            }
        } catch (error) {
            console.error('Personalization error:', error);
            setPersonalizedContent("Error connecting to personalization service.");
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <>
            <button
                className={styles.personalizeBtn}
                onClick={handlePersonalize}
                title="Personalize this page"
            >
                ✨ Personalize
            </button>

            {isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Personalized for {user?.name}</h3>
                            <button onClick={() => setIsOpen(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            {loading ? (
                                <div className={styles.loading}>
                                    <div className={styles.spinner}></div>
                                    <p>Rewriting content based on your profile...</p>
                                </div>
                            ) : (
                                <div className={styles.content}>
                                    {personalizedContent?.split('\n').map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PersonalizeButton;
