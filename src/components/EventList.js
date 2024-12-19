
import React from 'react';
import EventCard from './EventCard';
import './EventList.css';

function EventList({ events, title }) {
  const alertDetails = (title) => {
    alert(`Details for ${title}`);
  };

  return (
    <div className="event-list">
      <h2>{title}</h2>
      <div className="event-grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onViewDetails={alertDetails} />
        ))}
      </div>
    </div>
  );
}

export default EventList;