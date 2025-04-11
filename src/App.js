import React, { useState } from 'react';
import Chat from './Chat';

const App = () => {
  // We’ll store the senderId entered by the user.
  const [senderId, setSenderId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation: check if senderId is provided
    if (senderId.trim() === '') return;
    setSubmitted(true);
  };

  return (
    <div style={{ padding: '2rem' }}>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <h2>Enter Your Sender ID</h2>
          <input
            type="text"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            placeholder="Enter your senderId"
            style={{ padding: '0.5rem', width: '300px' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', marginLeft: '1rem' }}>
            Join Chat
          </button>
        </form>
      ) : (
        <Chat senderId={senderId} />
      )}
    </div>
  );
};

export default App;
