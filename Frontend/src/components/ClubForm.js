import React, { useState } from "react";
import axios from "axios";
import "../styles/ClubForm.css";

const ClubForm = () => {
  const [formData, setFormData] = useState({
    club_name: "",
    club_admin: "",
    club_description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/add_club", formData);
      alert(response.data.message);
      setFormData({
        club_name: "",
        club_admin: "",
        club_description: "",
      });
    } catch (error) {
      alert("Error adding club: " + (error.response?.data?.detail || error.message));
    }
  };
  return (
    <>
    <h2 className="form-title">Register New Club</h2>
    <form onSubmit={handleSubmit}>
      <label>Club Name:</label>
      <input
        type="text"
        name="club_name"
        value={formData.club_name}
        onChange={handleChange}
        placeholder="Enter club name"
        required
      />
  
      <label>Club Admin:</label>
      <input
        type="text"
        name="club_admin"
        value={formData.club_admin}
        onChange={handleChange}
        placeholder="Enter club admin name"
        required
      />
  
      <label>Club Description:</label>
      <textarea
        name="club_description"
        value={formData.club_description}
        onChange={handleChange}
        placeholder="Describe the club"
        rows={4}
        required
      ></textarea>
  
      <button type="submit">Add Club</button>
    </form>
  </>
  

  );
  
};

export default ClubForm;
