import React from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';

const CourseCard = ({ course, isTeacher, enrollHandler }) => {
  const {
    id,
    title,
    description,
    price,
    teacher,
  } = course;

  // Format the price from wei to ETH
  const formattedPrice = ethers.formatEther(price.toString());

  // Format teacher address
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 course-card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="badge bg-primary">{formattedPrice} ETH</span>
          {isTeacher ? (
            <span className="badge bg-info">My Course</span>
          ) : (
            <span className="text-muted small">By: {formatAddress(teacher)}</span>
          )}
        </div>
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <p className="card-text">
            {description.length > 100
              ? `${description.substring(0, 100)}...`
              : description}
          </p>
        </div>
        <div className="card-footer d-flex justify-content-between">
          {isTeacher ? (
            <Link to={`/teacher/course/${id}`} className="btn btn-outline-primary">
              Manage Course
            </Link>
          ) : (
            <>
              <Link to={`/course/${id}`} className="btn btn-outline-primary">
                View Details
              </Link>
              <button
                onClick={() => enrollHandler(id, price)}
                className="btn btn-primary"
              >
                Enroll Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard; 