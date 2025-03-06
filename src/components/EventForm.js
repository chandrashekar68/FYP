import React, { useState } from "react";
import axios from "axios";
import "../styles/EventForm.css"; // Ensure correct path

const EventForm = () => {
  const [formData, setFormData] = useState({
    event_name: "",
    organizer_name: "",
    club_id: "",
    is_internal: true,
    start_date_time: "",
    end_date_time: "",
    location_type: "virtual",
    location: "",
    max_participants: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/add_event", formData);
      alert(response.data.message);
      setFormData({
        event_name: "",
        organizer_name: "",
        club_id: "",
        is_internal: true,
        start_date_time: "",
        end_date_time: "",
        location_type: "virtual",
        location: "",
        max_participants: "",
      });
    } catch (error) {
      alert("Error adding event: " + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="event-form-container">
      <h2>Add New Event</h2>
      <form onSubmit={handleSubmit}>
        <label>Event Name:</label>
        <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} required />

        <label>Organizer Name:</label>
        <input type="text" name="organizer_name" value={formData.organizer_name} onChange={handleChange} required />

        <label>Club ID:</label>
        <input type="number" name="club_id" value={formData.club_id} onChange={handleChange} required />

        <label className="checkbox-label">
          <input type="checkbox" name="is_internal" checked={formData.is_internal} onChange={handleChange} />
          Internal Event
        </label>

        <label>Start Date & Time:</label>
        <input type="datetime-local" name="start_date_time" value={formData.start_date_time} onChange={handleChange} required />

        <label>End Date & Time:</label>
        <input type="datetime-local" name="end_date_time" value={formData.end_date_time} onChange={handleChange} required />

        <label>Location Type:</label>
        <select name="location_type" value={formData.location_type} onChange={handleChange} required>
          <option value="virtual">Virtual</option>
          <option value="onCampus">On Campus</option>
          <option value="offCampus">Off Campus</option>
        </select>

        <label>Location:</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} required />

        <label>Max Participants:</label>
        <input type="number" name="max_participants" value={formData.max_participants} onChange={handleChange} required />

        <button type="submit">Add Event</button>
      </form>
    </div>
  );
};

export default EventForm;
