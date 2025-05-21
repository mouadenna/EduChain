import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { getAllCourses, getStudentCourses, enrollInCourse } from '../utils/contractHelpers';
import CourseCard from '../components/CourseCard';

const StudentDashboard = () => {
  const { account, contract, signer } = useContext(Web3Context);
  
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (contract && account) {
          setLoading(true);
          
          // Get enrolled courses
          const studentCourses = await getStudentCourses(contract, account);
          setEnrolledCourses(studentCourses);
          
          // Create a Set of enrolled course IDs for easy checking
          const enrolledIds = new Set(studentCourses.map(course => course.id));
          setEnrolledCourseIds(enrolledIds);
          
          // Get all available courses
          const allCourses = await getAllCourses(contract);
          
          // Filter out courses created by the student and already enrolled courses
          const availableCourses = allCourses.filter(
            course => course.teacher !== account && !enrolledIds.has(course.id)
          );
          
          setAvailableCourses(availableCourses);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [contract, account]);
  
  // Handle course enrollment
  const handleEnroll = async (courseId, price) => {
    try {
      setEnrolling(true);
      setError('');
      
      await enrollInCourse(contract, signer, courseId, price);
      
      // Update the UI after enrollment
      const enrolledCourse = availableCourses.find(course => course.id === courseId);
      
      setEnrolledCourses([...enrolledCourses, enrolledCourse]);
      setEnrolledCourseIds(new Set([...enrolledCourseIds, courseId]));
      setAvailableCourses(availableCourses.filter(course => course.id !== courseId));
      
      setEnrolling(false);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError('Failed to enroll in the course. Please try again.');
      setEnrolling(false);
    }
  };
  
  return (
    <div className="container my-5">
      <h2 className="mb-4">Student Dashboard</h2>
      
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
          <p className="mt-2">Loading courses...</p>
        </div>
      ) : (
        <>
          {/* Enrolled Courses Section */}
          <section className="mb-5">
            <h3 className="mb-3">My Courses</h3>
            
            {enrolledCourses.length === 0 ? (
              <div className="card border-light mb-4">
                <div className="card-body text-center py-4">
                  <p className="mb-0">You haven't enrolled in any courses yet.</p>
                </div>
              </div>
            ) : (
              <div className="row">
                {enrolledCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isTeacher={false}
                    enrollHandler={() => {}}
                  />
                ))}
              </div>
            )}
          </section>
          
          {/* Available Courses Section */}
          <section>
            <h3 className="mb-3">Available Courses</h3>
            
            {availableCourses.length === 0 ? (
              <div className="card border-light">
                <div className="card-body text-center py-4">
                  <p className="mb-0">No courses are available at the moment.</p>
                </div>
              </div>
            ) : (
              <div className="row">
                {availableCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isTeacher={false}
                    enrollHandler={handleEnroll}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default StudentDashboard; 