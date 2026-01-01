import React from 'react';
import { Phone } from 'lucide-react';

const CallButton = ({ number, onClick }) => (
    <button type="button" onClick={onClick} style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px',
        backgroundColor: '#34A853', // Green color usually for calls
        color: 'white',
        borderRadius: '50px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
        <Phone size={18} />
        <span dir="ltr">{number}</span>
    </button>
);

const QuickCallFooter = ({ onCall }) => {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '1rem',
            backgroundColor: 'white',
            borderTop: '1px solid #eee'
        }}>
            <p style={{ textAlign: 'center', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>أرقام الطوارئ</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <CallButton number="1548" onClick={() => onCall('11257654312345')} />
                <CallButton number="104" onClick={() => onCall('1234567')} />
            </div>
        </footer>
    );
};

export default QuickCallFooter;
