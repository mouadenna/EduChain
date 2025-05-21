import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';
import { getCourse, getStudentProgress, completeModule, issueCertificate } from '../utils/contractHelpers';
import { ethers } from 'ethers';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, contract, signer } = useContext(Web3Context);
  
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({
    isEnrolled: false,
    completedModules: 0,
    coursePassed: false
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Create an array representing modules
  const [modules, setModules] = useState([]);
  const [completedModulesMap, setCompletedModulesMap] = useState({});
  
  // Fetch course and student progress
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (contract && account) {
          setLoading(true);
          
          // Get course details
          const courseData = await getCourse(contract, id);
          setCourse(courseData);
          
          // Generate modules array
          const moduleArray = Array.from({ length: parseInt(courseData.moduleCount) }, (_, i) => ({
            id: i,
            title: `Module ${i + 1}`,
            completed: false
          }));
          setModules(moduleArray);
          
          // Get student progress
          const progressData = await getStudentProgress(contract, id, account);
          setProgress(progressData);
          
          // Create a map of completed modules
          const completedMap = {};
          // This is a simplification - in a real app, you'd track individual module completion
          for (let i = 0; i < progressData.completedModules; i++) {
            completedMap[i] = true;
          }
          setCompletedModulesMap(completedMap);
          
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [contract, account, id]);
  
  // Handle module completion
  const handleCompleteModule = async (moduleIndex) => {
    try {
      setProcessing(true);
      setError('');
      setSuccessMessage('');
      
      console.log('Attempting to complete module:', {
        courseId: id,
        moduleIndex,
        accountAddress: account
      });
      
      // First verify current progress
      const currentProgress = await getStudentProgress(contract, id, account);
      console.log('Current progress before module completion:', currentProgress);
      
      try {
        // Complete the module
        const result = await completeModule(contract, signer, id, moduleIndex);
        
        if (result) {
          console.log('Module completion successful');
          
          // Verify the module was actually completed
          const updatedProgress = await getStudentProgress(contract, id, account);
          console.log('Updated progress after module completion:', updatedProgress);
          
          // Update local state based on actual blockchain state
          setCompletedModulesMap((prevState) => {
            const newState = { ...prevState };
            // Mark this module as completed
            newState[moduleIndex] = true;
            return newState;
          });
          
          setProgress({
            isEnrolled: updatedProgress.isEnrolled,
            completedModules: parseInt(updatedProgress.completedModules),
            coursePassed: updatedProgress.coursePassed
          });
          
          setSuccessMessage(`Module ${moduleIndex + 1} completed successfully!`);
        } else {
          setError('Module completion transaction failed. Please try again.');
        }
      } catch (moduleError) {
        console.error('Module completion error:', moduleError);
        
        if (moduleError.message && moduleError.message.includes('Module already completed')) {
          setError('This module has already been completed.');
          
          // Still update the UI to show it as completed
          setCompletedModulesMap({
            ...completedModulesMap,
            [moduleIndex]: true
          });
        } else {
          setError(`Failed to complete module: ${moduleError.message || 'Unknown error'}`);
        }
      }
      
      setProcessing(false);
    } catch (err) {
      console.error('General error in module completion:', err);
      setError(`Failed to complete module. Please try again. (${err.message || 'Unknown error'})`);
      setProcessing(false);
    }
  };
  
  // Handle certificate issuance
  const handleGetCertificate = async () => {
    try {
      setProcessing(true);
      setError('');
      setSuccessMessage('');
      
      // First check if all modules are completed
      const currentProgress = await getStudentProgress(contract, id, account);
      console.log('Current progress before issuing certificate:', currentProgress);
      
      if (!currentProgress.coursePassed) {
        setError('You must complete all modules before getting a certificate.');
        setProcessing(false);
        return;
      }
      
      console.log('Attempting to issue certificate for course:', id);
      
      try {
        const certificateId = await issueCertificate(contract, signer, id);
        console.log('Certificate issued with ID:', certificateId);
        
        setSuccessMessage('Certificate issued successfully! View it in your certificates page.');
        setProcessing(false);
        
        // Navigate to certificates page after a brief delay
        setTimeout(() => {
          navigate('/certificates');
        }, 2000);
      } catch (certError) {
        console.error('Certificate issuance error:', certError);
        
        // Check for specific error messages
        if (certError.message && certError.message.includes('Course not completed yet')) {
          setError('You must complete all modules before getting a certificate.');
        } else if (certError.message && certError.message.includes('Certificate already issued')) {
          setError('You already have a certificate for this course. Check your certificates page.');
          
          // Navigate to certificates page after a brief delay
          setTimeout(() => {
            navigate('/certificates');
          }, 3000);
        } else {
          setError(`Failed to issue certificate: ${certError.message || 'Unknown error'}`);
        }
        
        setProcessing(false);
      }
    } catch (err) {
      console.error('General error in certificate handling:', err);
      setError(`Failed to issue certificate. Please try again. (${err.message || 'Unknown error'})`);
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading course details...</p>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">
          Course not found or you don't have access to this course.
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/student')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  // Format price from wei to ETH
  const formattedPrice = ethers.formatEther(course.price.toString());
  
  // Calculate progress percentage
  const progressPercentage = modules.length > 0 
    ? Math.round((Object.keys(completedModulesMap).length / modules.length) * 100) 
    : 0;
  
  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-lg-8">
          <h2 className="mb-3">{course.title}</h2>
          
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}
          
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Course Description</h5>
              <p className="card-text">{course.description}</p>
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <strong>Price:</strong> {formattedPrice} ETH
                </span>
                <span>
                  <strong>Teacher:</strong> {course.teacher.slice(0, 6)}...{course.teacher.slice(-4)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Course Content</h5>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span>Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-primary" 
                    role="progressbar" 
                    style={{ width: `${progressPercentage}%` }}
                    aria-valuenow={progressPercentage}
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              
              <div className="list-group">
                {modules.map((module, index) => (
                  <div 
                    key={index}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 className="mb-0">{module.title}</h6>
                      <a 
                        href={course.contentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="small"
                      >
                        View Content
                      </a>
                    </div>
                    
                    {completedModulesMap[index] ? (
                      <span className="badge bg-success">Completed</span>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleCompleteModule(index)}
                        disabled={processing}
                      >
                        {processing ? 'Processing...' : 'Mark as Completed'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {progress.coursePassed && (
            <div className="text-center mt-4">
              <button
                className="btn btn-success"
                onClick={handleGetCertificate}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  'Get Your Certificate'
                )}
              </button>
            </div>
          )}
        </div>
        
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '1rem' }}>
            <div className="card-body">
              <h5 className="card-title">Course Information</h5>
              <p className="card-text">
                <strong>Modules:</strong> {course.moduleCount}
              </p>
              <p className="card-text">
                <strong>Enrolled:</strong> {progress.isEnrolled ? 'Yes' : 'No'}
              </p>
              <p className="card-text">
                <strong>Completed Modules:</strong> {Object.keys(completedModulesMap).length} / {modules.length}
              </p>
              <p className="card-text">
                <strong>Status:</strong> {progress.coursePassed ? (
                  <span className="text-success">Completed</span>
                ) : (
                  <span className="text-warning">In Progress</span>
                )}
              </p>
              
              <div className="d-grid gap-2 mt-4">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/student')}
                >
                  Back to Dashboard
                </button>
                
                {progress.coursePassed && (
                  <button
                    className="btn btn-outline-success"
                    onClick={() => navigate('/certificates')}
                  >
                    View Certificates
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;