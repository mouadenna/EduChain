import React from 'react';

const Footer = () => {
  return (
    <footer className="footer mt-auto py-3 bg-dark text-light">
      <div className="container text-center">
        <p className="mb-0">
          <span className="text-primary">Edu</span>Chain &copy; {new Date().getFullYear()} - 
          Decentralized E-Learning Platform on Ethereum
        </p>
        <p className="small text-muted mb-0">
          All certifications secured and verified on the blockchain
        </p>
      </div>
    </footer>
  );
};

export default Footer; 