import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';
import { createCourse } from '../utils/contractHelpers';

const CreateCourse = () => {
  const { contract, signer, account, isTeacher } = useContext(Web3Context);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    contentUrl: '',
    moduleCount: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Validation check on component mount
  useEffect(() => {
    // Check if user is logged in as teacher
    if (!account) {
      navigate('/login');
    } else if (!isTeacher) {
      navigate('/student');
    }
    
    // Check if contract is initialized
    if (!contract) {
      setError('Smart contract not initialized. Please check your network connection and contract address.');
    }
  }, [account, isTeacher, contract, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.title || !formData.description || !formData.price || !formData.contentUrl || !formData.moduleCount) {
      setError('All fields are required');
      return;
    }
    
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('Price must be a positive number');
      return;
    }
    
    if (isNaN(formData.moduleCount) || parseInt(formData.moduleCount) <= 0) {
      setError('Module count must be a positive number');
      return;
    }
    
    // Check if user is logged in and contract is initialized
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!contract) {
      setError('Smart contract not initialized. Please check your network connection and contract address.');
      return;
    }
    
    if (!signer) {
      setError('Signer not available. Please reconnect your wallet.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Log transaction details for debugging
      console.log('Creating course with parameters:', {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        contentUrl: formData.contentUrl,
        moduleCount: parseInt(formData.moduleCount)
      });
      
      console.log('Contract address:', contract.target);
      console.log('Signer address:', await signer.getAddress());
      
      try {
        await createCourse(
          contract,
          signer,
          formData.title,
          formData.description,
          formData.price,
          formData.contentUrl,
          parseInt(formData.moduleCount)
        );
        
        setSubmitting(false);
        navigate('/teacher');
      } catch (txError) {
        console.error('Transaction error:', txError);
        
        // Display more specific error message based on the error
        if (txError.message && txError.message.includes('user rejected transaction')) {
          setError('Transaction was rejected. Please approve the transaction in MetaMask.');
        } else if (txError.message && txError.message.includes('insufficient funds')) {
          setError('Insufficient funds to complete the transaction. Please check your ETH balance.');
        } else if (txError.message && txError.message.includes('contract not deployed')) {
          setError('Contract not found at the specified address. Please check your contract deployment.');
        } else {
          // Extract inner error message if available
          const innerError = txError.message || 'Unknown blockchain error';
          setError(`Failed to create course: ${innerError}`);
        }
        
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error creating course:', err);
      setError(`Failed to create course: ${err.message || 'Unknown error'}`);
      setSubmitting(false);
    }
  };
  
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="mb-4">Create New Course</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {!contract && (
                <div className="alert alert-warning mb-4" role="alert">
                  <strong>Smart contract not initialized!</strong> 
                  <p className="mb-0">Please make sure:</p>
                  <ul className="mb-0">
                    <li>You are connected to the correct network</li>
                    <li>The contract address is correctly set in the application</li>
                    <li>The contract is deployed and active</li>
                  </ul>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Course Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">Price (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="10"
                    className="form-control"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                  <div className="form-text">
                    Set the price in ETH (e.g., 0.05). For values over 10, they will be converted to smaller ETH amounts (e.g., 50 → 0.05 ETH).
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="contentUrl" className="form-label">Content URL</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contentUrl"
                    name="contentUrl"
                    value={formData.contentUrl}
                    onChange={handleChange}
                    required
                  />
                  <div className="form-text">URL to your course content (IPFS link recommended for decentralization)</div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="moduleCount" className="form-label">Number of Modules</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    id="moduleCount"
                    name="moduleCount"
                    value={formData.moduleCount}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || !contract}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Course...
                      </>
                    ) : (
                      'Create Course'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/teacher')}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse; 