import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ClubRegistration.css"; // Importing CSS for styling

const ClubRegistration = () => {
  const [clubs, setClubs] = useState([]); // Stores the list of clubs
  const [selectedClub, setSelectedClub] = useState(null); // Stores selected club object
  const [message, setMessage] = useState("");

  const email = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  // Fetch clubs from the backend when the component loads
  useEffect(() => {
    axios
      .get("http://localhost:8000/get_clubs")
      .then((response) => {
        setClubs(response.data.clubs); // Clubs now include both club_id and club_name
      })
      .catch((error) => {
        console.error("Error fetching clubs:", error);
      });
  }, []);

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !selectedClub) {
      setMessage("Please enter your email and select a club.");
      return;
    }

    try { 
      const response = await axios.post(
        `http://localhost:8000/users/${email}/register_club`,
        {
          club_id: selectedClub.club_id, // Send club_id (integer)
          club_name: selectedClub.club_name, // Send club_name (string)
        },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage(response.data.message);

      navigate('/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.detail || "Registration failed.");
    }
  };

  return (
    <div className="container">
      <h2>Register for a Club</h2>
      <form onSubmit={handleRegister} className="form">
        <label>Select Club:</label>
        <select
          value={selectedClub ? selectedClub.club_id : ""}
          onChange={(e) => {
            const selectedOption = clubs.find(
              (club) => club.club_id === parseInt(e.target.value)
            );
            setSelectedClub(selectedOption);
          }}
          required
        >
          <option value="">-- Select a Club --</option>
          {clubs.map((club) => (
            <option key={club.club_id} value={club.club_id}>
              {club.club_name} {/* Display name, but store ID */}
            </option>
          ))}
        </select>

        <button type="submit">Register</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ClubRegistration;
