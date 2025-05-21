import React, { useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';

const Login = () => {
  const { account, accounts, connectWallet, switchAccount, error } = useContext(Web3Context);
  const [userType, setUserType] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);

  // Initially get accounts
  useEffect(() => {
    const getAccounts = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        setAvailableAccounts(accounts);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };

    if (window.ethereum) {
      getAccounts();
    }
  }, []);

  const handleConnect = async (type) => {
    setUserType(type);
    setConnecting(true);
    
    try {
      // First connect with no specific account
      await connectWallet(type);
      
      // Check if we have multiple accounts
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      
      setAvailableAccounts(accounts);
      
      // If multiple accounts, show selector
      if (accounts.length > 1) {
        setShowAccountSelector(true);
      }
    } catch (err) {
      console.error("Connection error:", err);
    } finally {
      setConnecting(false);
    }
  };
  
  const handleAccountSelect = async (selectedAccount) => {
    setConnecting(true);
    await switchAccount(selectedAccount);
    setConnecting(false);
    setShowAccountSelector(false);
  };

  // Redirect if already connected
  if (account && !showAccountSelector) {
    if (userType === 'teacher') {
      return <Navigate to="/teacher" />;
    } else {
      return <Navigate to="/student" />;
    }
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-5">
              {showAccountSelector ? (
                <>
                  <h2 className="text-center mb-4">Select Account</h2>
                  <p className="text-center text-muted mb-4">
                    Choose which account you want to use
                  </p>
                  <div className="list-group mb-4">
                    {availableAccounts.map((acc, index) => (
                      <button
                        key={acc}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={() => handleAccountSelect(acc)}
                        disabled={connecting}
                      >
                        <div>
                          <span className="badge bg-primary me-2">
                            {index + 1}
                          </span>
                          {acc.substring(0, 6)}...{acc.substring(acc.length - 4)}
                        </div>
                        {connecting && (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        )}
                      </button>
                    ))}
                  </div>
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setShowAccountSelector(false)}
                  >
                    Back
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-center mb-4">Connect Your Wallet</h2>
                  
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  
                  <p className="text-center text-muted mb-4">
                    Please connect your MetaMask wallet and choose your role to continue
                  </p>
                  
                  <div className="d-grid gap-3">
                    <button
                      onClick={() => handleConnect('teacher')}
                      className="btn btn-lg btn-outline-primary"
                      disabled={connecting}
                    >
                      {connecting && userType === 'teacher' ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="bi bi-mortarboard me-2"></i>
                      )}
                      Connect as Teacher
                    </button>
                    
                    <button
                      onClick={() => handleConnect('student')}
                      className="btn btn-lg btn-primary"
                      disabled={connecting}
                    >
                      {connecting && userType === 'student' ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="bi bi-book me-2"></i>
                      )}
                      Connect as Student
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-center text-muted small">
                      Don't have MetaMask yet?{' '}
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download here
                      </a>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 