import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container my-5">
      <div className="row align-items-center">
        <div className="col-lg-6">
          <h1 className="display-4 fw-bold mb-4">
            <span className="text-primary">Edu</span>Chain
          </h1>
          <h2 className="mb-4">Decentralized Learning Platform on Ethereum</h2>
          <p className="lead mb-4">
            Learn from experts, earn verifiable certificates, and take control of your education.
            All secured by blockchain technology.
          </p>
          <div className="d-flex gap-3">
            <Link to="/login" className="btn btn-primary btn-lg">
              Get Started
            </Link>
          </div>
        </div>
        <div className="col-lg-6 mt-5 mt-lg-0">
          <div className="card bg-light">
            <div className="card-body p-4">
              <h3 className="card-title mb-3">Key Features</h3>
              <ul className="list-group list-group-flush">
                <li className="list-group-item bg-transparent">
                  <i className="bi bi-lock-fill text-primary me-2"></i>
                  Secure payments with Ethereum cryptocurrency
                </li>
                <li className="list-group-item bg-transparent">
                  <i className="bi bi-award-fill text-primary me-2"></i>
                  Blockchain-verified certificates
                </li>
                <li className="list-group-item bg-transparent">
                  <i className="bi bi-person-fill text-primary me-2"></i>
                  Connect directly with teachers
                </li>
                <li className="list-group-item bg-transparent">
                  <i className="bi bi-cash-stack text-primary me-2"></i>
                  Fair payment system without intermediaries
                </li>
                <li className="list-group-item bg-transparent">
                  <i className="bi bi-shield-check text-primary me-2"></i>
                  Immutable proof of your achievements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5 pt-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="display-6 text-primary mb-3">
                <i className="bi bi-mortarboard-fill"></i>
              </div>
              <h3 className="card-title">For Students</h3>
              <p className="card-text">
                Browse courses, pay with ETH, and earn blockchain-verified certificates.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="display-6 text-primary mb-3">
                <i className="bi bi-person-workspace"></i>
              </div>
              <h3 className="card-title">For Teachers</h3>
              <p className="card-text">
                Create courses, reach global audience, and receive direct payments.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="display-6 text-primary mb-3">
                <i className="bi bi-credit-card-2-front-fill"></i>
              </div>
              <h3 className="card-title">For Everyone</h3>
              <p className="card-text">
                A transparent, secure platform built on Ethereum blockchain technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 