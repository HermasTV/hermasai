// components/Footer.js

import React from 'react';

const Footer = () => {
  return (
    <div>
      <footer className="container text-muted">
        <p className="text-center">© 2024 | Ahmed Hermas | All Rights Reserved.</p>
      </footer>
      <style jsx>{`
        footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            position: absolute;
            bottom: 0;
            width: 100%;
          }
      `}</style>
    </div>
  );
};

export default Footer;
