import React from 'react';
import '../styles/EventCard.css';

function EventCard({ event, onViewDetails }) {
  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>Date: {event.date}</p>
      <p>Category: {event.category}</p>
      <button onClick={() => onViewDetails(event.title)}>
        View Details
      </button>
    </div>
  );
}

export default EventCard;