import React from 'react';
import { AuthProvider } from '../components/AuthContext';
import Chatbot from '../components/Chatbot';
import PersonalizeButton from '../components/PersonalizeButton';

// Default implementation, that you can customize
export default function Root({ children }) {
    return (
        <AuthProvider>
            {children}
            <PersonalizeButton />
            <Chatbot />
        </AuthProvider>
    );
}
