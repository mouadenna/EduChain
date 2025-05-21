import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';

const Navbar = () => {
  const { account, isTeacher, disconnectWallet } = useContext(Web3Context);
  const navigate = useNavigate();

  const handleDisconnect = () => {
    disconnectWallet();
    navigate('/');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span className="text-primary">Edu</span>Chain
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            
            {account && isTeacher && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/teacher">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/create-course">
                    Create Course
                  </Link>
                </li>
              </>
            )}
            
            {account && !isTeacher && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/student">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/certificates">
                    My Certificates
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          <div className="d-flex">
            {account ? (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">
                  <small className="text-muted me-2">
                    {isTeacher ? 'Teacher' : 'Student'}:
                  </small>
                  {formatAddress(account)}
                </span>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Connect Wallet
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 