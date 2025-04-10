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
    is_paid_event: false,  // New field for is paid event
    event_price: ""        // New field for event cost
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    let newValue = value;
  
    // Convert to appropriate types
    if (type === "checkbox") {
      newValue = checked;
    } else if (["club_id", "max_participants"].includes(name)) {
      newValue = parseInt(value, 10) || 0;
    } else if (name === "event_price") {
      newValue = parseFloat(value) || 0.0;
    }
  
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
  
      // 👇 Prevent 422: Remove price if event is free
      if (!payload.is_paid_event) {
        delete payload.event_price;
      }

      if (payload.location_type === "virtual") {
        payload.location = "virtual"
      }
  
      const response = await axios.post("http://localhost:8000/add_event", payload);
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
        is_paid_event: false,
        event_price: "",
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
        <input
          type="text"
          name="event_name"
          value={formData.event_name}
          onChange={handleChange}
          required
        />

        <label>Organizer Name:</label>
        <input
          type="text"
          name="organizer_name"
          value={formData.organizer_name}
          onChange={handleChange}
          required
        />

        <label>Club ID:</label>
        <input
          type="number"
          name="club_id"
          value={formData.club_id}
          onChange={handleChange}
          required
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_internal"
            checked={formData.is_internal}
            onChange={handleChange}
          />
          Internal Event
        </label>

        <label>Start Date & Time:</label>
        <input
          type="datetime-local"
          name="start_date_time"
          value={formData.start_date_time}
          onChange={handleChange}
          required
        />

        <label>End Date & Time:</label>
        <input
          type="datetime-local"
          name="end_date_time"
          value={formData.end_date_time}
          onChange={handleChange}
          required
        />

        <label>Location Type:</label>
        <select
          name="location_type"
          value={formData.location_type}
          onChange={handleChange}
          required
        >
          <option value="virtual">Virtual</option>
          <option value="onCampus">On Campus</option>
          <option value="offCampus">Off Campus</option>
        </select>

        {formData.location_type !== "virtual" && (
        <>
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </>
        )}

        <label>Max Participants:</label>
        <input
          type="number"
          name="max_participants"
          value={formData.max_participants}
          onChange={handleChange}
          required
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_paid_event"
            checked={formData.is_paid_event}
            onChange={handleChange}
          />
          Paid Event
        </label>

        {formData.is_paid_event && (
          <div>
            <label>Event Price:</label>
            <input
              type="number"
              name="event_price"
              value={formData.event_price}
              onChange={handleChange}
              required={formData.is_paid_event}
              min="0"
            />
          </div>
        )}

        <button type="submit">Add Event</button>
      </form>
    </div>
  );
};

export default EventForm;
