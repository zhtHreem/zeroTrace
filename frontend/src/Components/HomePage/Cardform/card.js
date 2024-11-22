import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './card.css';
import formIcon from '../images/form.png'; // Use a generic form icon

const FormCards = () => {
  const navigate=useNavigate();
  const [forms, setForms] = useState([]); // Initialize forms as an empty array
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track errors
  const [showAll, setShowAll] = useState(false); // Toggle to show all forms

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/forms');
        setForms(response.data); // Update forms with fetched data
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Failed to fetch forms:', err);
        setError('Failed to load forms. Please try again.'); // Set error message
      } finally {
        setLoading(false); // Stop the loading indicator
      }
    };

    fetchForms();
  }, []); // Run only on component mount

  // Render loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  // Render error state
  if (error) {
    return <p>{error}</p>;
  }

  // Render empty state
  if (!forms || forms.length === 0) {
    return <p>No forms available</p>;
  }

  // Determine the forms to display based on `showAll` state
  const displayedForms = showAll ? forms : forms.slice(0, 6);

  return (
    <div className="form-cards-container">
      <h1>Explore Surveys</h1>
      <div className="form-cards-grid">
        {displayedForms.map((form) => (
          <div key={form._id} className="form-card">
            <img src={formIcon} alt="Form Icon" className="form-icon" />
            <h3>{form.title}</h3> {/* Display the title */}
          </div>
        ))}
      </div>
      {/* Show 'See More' button if there are more than 6 forms */}
      {!showAll && forms.length > 6 && (
        <button className="see-more-button" onClick={() => {navigate("/surveys");setShowAll(true)}}>
          See More
        </button>
      )}
      {/* Show 'Show Less' button to collapse the list */}
      {showAll && (
        <button className="see-more-button" onClick={() => setShowAll(false)}>
          Show Less
        </button>
      )}
    </div>
  );
};

export default FormCards;
