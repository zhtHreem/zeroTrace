import React, { useState } from 'react';

function SurveyForm() {
  const [response, setResponse] = useState('');
  const [surveyId, setSurveyId] = useState('');
  const [unlockAt, setUnlockAt] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload
    const payload = {
      response,
      surveyId,
      unlockAt: new Date(unlockAt).toISOString(), // Convert to ISO string
    };

    try {
      // Submit the form data to the server
      const res = await fetch('http://localhost:5000/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.text();
      alert(result); // Show server response
    } catch (err) {
      console.error('Error submitting survey:', err);
      alert('Failed to submit survey response.');
    }
  };

  return (
    <div>
      <h1>Submit Survey Response</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Survey ID:
          <input
            type="text"
            value={surveyId}
            onChange={(e) => setSurveyId(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Response:
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Unlock At:
          <input
            type="datetime-local"
            value={unlockAt}
            onChange={(e) => setUnlockAt(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default SurveyForm;
