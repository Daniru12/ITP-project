import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import User from '../User/User';
import { useReactToPrint } from 'react-to-print';
import './details.css';
import food from './food.jpg';

const URL = 'http://localhost:5000/users/';

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function UserDetails() {
  const [users, setUsers] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    fetchHandler().then((data) => setUsers(data.users));
  }, []);

  const ComponentsRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => ComponentsRef.current,
    documentTitle: 'User Report',
    onAfterPrint: () => alert('User Report Successfully Downloaded!'),
  });

  const handleSearch = () => {
    fetchHandler().then((data) => {
      const filteredUsers = data.users.filter((user) =>
        Object.values(user).some((field) =>
          field.toString().toLowerCase().includes(searchQuery.toLowerCase()) // Corrected here
        )
      );
      setUsers(filteredUsers);
      setNoResults(filteredUsers.length === 0);
    });
  };

  const handleSendReport = () => {
    // Create the WhatsApp chat URL
    const phoneNumber = "+94702324295"; // Example phone number
    const message = `Select User Reports`; // Message to send
    const WhatsAppUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    // Open WhatsApp chat in a new window
    window.open(WhatsAppUrl, "_blank");
  };

  return (
    <div class="user-section">
      
      <div class="search-container">
        <input
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
          name="search"
          placeholder="Search User Details"
          class="search-input"
        />
        <button onClick={handleSearch} class="search-btn">Search</button>
      </div>

      {noResults ? (
        <div class="no-results">
          <p>No Result Found</p>
        </div>
      ) : (
        <div ref={ComponentsRef} class="user-list">
          {users &&
            users.map((user, i) => (
              <div key={i} class="user-item">
                <img
                  src={food}
                  alt="Profile"
                  className="user-photo"
                />
                <User user={user} />
              </div>
            ))}
        </div>
      )}

      <div class="action-buttons">

        <button onClick={handleSendReport} class="whatsapp-btn">Send via WhatsApp</button>
      </div>
    </div>

  );
}

export default UserDetails;
