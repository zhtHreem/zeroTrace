import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import formIcon from '../images/form.png';

const FormCards = () => {
  const [forms, setForms] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/forms');
        const data = await response.json();
        setForms(data);
      } catch (err) {
        console.error('Failed to fetch forms:', err);
      }
    };

    fetchForms();
  }, []);

  const displayedForms = showAll ? forms : forms.slice(0, 6); // Show only 6 if showAll is false

  return (
    <div className="form-cards-container">
      <h1>Explore Surveys</h1>
      <div className="form-cards-grid">
        {displayedForms.map((form) => (
          <div
            key={form._id}
            className="form-card"
            onClick={() => navigate(`/form/${form._id}`)} // Navigate to form on click
          >
            <img src={formIcon} alt="Form Icon" className="form-icon" />
            <h3>{form.title}</h3>
          </div>
        ))}
      </div>
      {/* Conditional rendering for "See More" and "Show Less" buttons */}
      {!showAll && forms.length > 6 && (
        <button
          className="see-more-button"
          onClick={() => { 
            navigate("/surveys"); 
            setShowAll(true); 
          }}
        >
          See More
        </button>
      )}
      {showAll && (
        <button
          className="see-more-button"
          onClick={() => setShowAll(false)}
        >
          Show Less
        </button>
      )}
    </div>
  );
};

export default FormCards;
