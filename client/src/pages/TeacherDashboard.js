import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';
import { getTeacherCourses } from '../utils/contractHelpers';
import CourseCard from '../components/CourseCard';

const TeacherDashboard = () => {
  const { account, contract, signer } = useContext(Web3Context);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (contract && account) {
          setLoading(true);
          const teacherCourses = await getTeacherCourses(contract, account);
          setCourses(teacherCourses);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching teacher courses:', err);
        setError('Failed to load your courses. Please try again later.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, [contract, account]);

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Teacher Dashboard</h2>
        <Link to="/create-course" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Create New Course
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
          <p className="mt-2">Loading your courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="card border-light my-5">
          <div className="card-body text-center py-5">
            <h3 className="mb-3">You haven't created any courses yet</h3>
            <p className="text-muted mb-4">
              Start sharing your knowledge by creating your first course.
            </p>
            <Link to="/create-course" className="btn btn-primary">
              Create Your First Course
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <p className="text-muted">
              You have created {courses.length} course{courses.length !== 1 ? 's' : ''}.
            </p>
          </div>

          <div className="row">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isTeacher={true}
                enrollHandler={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard; 