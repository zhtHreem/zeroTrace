import React, { useState } from 'react';

function ViewResponse() {
  const [responseId, setResponseId] = useState(''); // Input for response ID
  const [decryptedResponse, setDecryptedResponse] = useState(''); // Store decrypted response
  const [error, setError] = useState(''); // Store errors

  const fetchDecryptedResponse = async () => {
    // Clear previous states
    setDecryptedResponse('');
    setError('');

    try {
      // Fetch the decrypted response from the backend
      const res = await fetch(`http://localhost:5000/decrypt/${responseId}`); // Adjust URL as necessary
      if (res.ok) {
        const data = await res.json(); // Parse JSON response
        setDecryptedResponse(data.decryptedResponse); // Update state with decrypted response
      } else {
        const message = await res.text(); // Read error message from server
        setError(message); // Display error to user
      }
    } catch (err) {
      console.error('Error fetching decrypted response:', err);
      setError('Failed to fetch the response. Please try again later.');
    }
  };

  return (
    <div>
      <h1>View Survey Response</h1>
      <div>
        <label>
          Enter Response ID:
          <input
            type="text"
            value={responseId}
            onChange={(e) => setResponseId(e.target.value)}
            placeholder="Response ID"
            required
          />
        </label>
        <button onClick={fetchDecryptedResponse}>Fetch Response</button>
      </div>

      {decryptedResponse && (
        <div style={{ marginTop: '20px' }}>
          <h3>Decrypted Response:</h3>
          <pre>{decryptedResponse}</pre> {/* Nicely formatted response */}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export default ViewResponse;
