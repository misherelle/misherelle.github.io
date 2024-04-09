import React from 'react';
import './Header.css';

const Header = () => {
    const logoUrl = '/page-icon.png';

    return (
        <header className="header">
            <h1>
                <a href="/">
                    <img src={logoUrl} alt="StockView Logo" className="page-icon" />
                </a>
                <a href="/">StockView</a>
            </h1>
            <h3>Navigate the market with precision.</h3>
        </header>
    );
};

export default Header;
