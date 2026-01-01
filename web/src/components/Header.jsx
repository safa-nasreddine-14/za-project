import React from 'react';

const Header = () => {
    return (
        <header style={{
            backgroundColor: 'var(--primary-blue)',
            color: 'white',
            padding: '1rem',
            textAlign: 'center',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>المديرية العامة للحماية المدنية</h1>
        </header>
    );
};

export default Header;
