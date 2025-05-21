import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import { Web3Provider } from './contexts/Web3Context';

const root = createRoot(document.getElementById('root'));

root.render(
  <Router>
    <Web3Provider>
      <App />
    </Web3Provider>
  </Router>
); 