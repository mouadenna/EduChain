import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';
import { getStudentCertificates, getCourse } from '../utils/contractHelpers';
import CertificateCard from '../components/CertificateCard';

const Certificates = () => {
  const { account, contract } = useContext(Web3Context);
  
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        if (contract && account) {
          setLoading(true);
          
          // Get all certificates for the student
          const certs = await getStudentCertificates(contract, account);
          
          // Get course details for each certificate
          const certificatesWithDetails = await Promise.all(
            certs.map(async (cert) => {
              const course = await getCourse(contract, cert.courseId);
              return {
                ...cert,
                courseName: course.title
              };
            })
          );
          
          setCertificates(certificatesWithDetails);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setError('Failed to load your certificates. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, [contract, account]);
  
  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Certificates</h2>
        <Link to="/student" className="btn btn-outline-primary">
          Back to Dashboard
        </Link>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="card border-light my-5">
          <div className="card-body text-center py-5">
            <h3 className="mb-3">You don't have any certificates yet</h3>
            <p className="text-muted mb-4">
              Complete courses to earn blockchain-verified certificates.
            </p>
            <Link to="/student" className="btn btn-primary">
              Browse Courses
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">
            You have earned {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}.
            These certificates are secured and verified on the Ethereum blockchain.
          </p>
          
          <div className="row">
            <div className="col-lg-10 mx-auto">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="mb-4">
                  <CertificateCard
                    certificate={certificate}
                    courseName={certificate.courseName}
                    timestamp={certificate.timestamp}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Certificates; 