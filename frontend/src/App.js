import React, { useState, useEffect } from 'react';

function App() {
  const [response, setResponse] = useState('');
  const [encryptedResponseId, setEncryptedResponseId] = useState(null);
  const [decryptedResponse, setDecryptedResponse] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response,
          surveyId: '123', // Example Survey ID
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEncryptedResponseId(data.id);
        setIsLocked(true);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  useEffect(() => {
    if (encryptedResponseId && isLocked) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:5000/response/${encryptedResponseId}`);
          if (res.ok) {
            const data = await res.json();
            setDecryptedResponse(data.decryptedResponse);
            setIsLocked(false);
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error fetching decrypted response:', error);
        }
      }, 5000); // Poll every 5 seconds
    }
  }, [encryptedResponseId, isLocked]);

  return (
    <div>
      <h1>Survey App</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Enter your survey response"
          required
        />
        <button type="submit" disabled={isLocked}>
          {isLocked ? 'Response Locked' : 'Submit'}
        </button>
      </form>

      {decryptedResponse && (
        <div>
          <h3>Decrypted Response</h3>
          <p>{decryptedResponse}</p>
        </div>
      )}
    </div>
  );
}

export default App;
