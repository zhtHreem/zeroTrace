import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './card.css';
import formIcon from '../images/form.png';

const FormCards = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/forms');
        setForms(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch forms:', err);
        setError('Failed to load forms. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!forms || forms.length === 0) {
    return <p>No forms available</p>;
  }

  const displayedForms = showAll ? forms : forms.slice(0, 6);

  return (
    <div className="form-cards-container">
      <h1>Explore Surveys</h1>
      <div className="form-cards-grid">
        {displayedForms.map((form) => (
          <div
            key={form._id}
            className="form-card"
            onClick={() => navigate(`/form/${form._id}`)} // Navigate to the form's route
            
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
