import React from 'react';

const CertificateCard = ({ certificate, courseName, timestamp }) => {
  // Format date from timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="certificate">
      <div className="text-center mb-4">
        <h3 className="mb-0">Certificate of Completion</h3>
        <p className="text-muted">Issued on the Ethereum Blockchain</p>
      </div>

      <div className="text-center mb-4">
        <p className="mb-0">This is to certify that</p>
        <h5 className="mb-0">{certificate.student}</h5>
        <p>has successfully completed the course</p>
        <h4 className="mb-3">{courseName}</h4>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <small className="text-muted">Certificate ID</small>
          <p className="mb-0">{certificate.id}</p>
        </div>
        <div className="col-md-6 text-md-end">
          <small className="text-muted">Issue Date</small>
          <p className="mb-0">{formatDate(timestamp)}</p>
        </div>
      </div>

      <div className="text-center mt-4">
        <a 
          href={`https://etherscan.io/tx/${certificate.id}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-primary"
        >
          Verify on Blockchain
        </a>
      </div>
    </div>
  );
};

export default CertificateCard; 