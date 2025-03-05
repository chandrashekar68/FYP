// import React, { useEffect, useState } from 'react';
// import EventCard from './EventCard';
// import './styles/EventList.css';
// import { events as DEFAULT_EVENTS } from './sample_events'; // Import default events

// function EventList({ userEmail, title }) {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUserEvents = async () => {
//       try {
//         if (!userEmail) {
//           throw new Error("User email is missing");
//         }

//         // Fetch user-specific events from the backend
//         const response = await fetch(`http://localhost:8000/users/${userEmail}/events`);
        
//         if (!response.ok) {
//           throw new Error(`Failed to fetch events: ${response.statusText}`);
//         }

//         const data = await response.json();
//         setEvents(data);
//       } catch (err) {
//         console.error("Error fetching user events:", err);
//         setError(err.message);
//         setEvents(DEFAULT_EVENTS); // Fallback to default events
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserEvents();
//   }, [userEmail]);

//   if (loading) {
//     return <div>Loading events...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}. Showing default events instead.</div>;
//   }

//   return (
//     <div className="event-list">
//       <h2>{title}</h2>
//       <div className="event-grid">
//         {events.length > 0 ? (
//           events.map((event) => (
//             <EventCard key={event.id} event={event} onViewDetails={() => alert(`Details for ${event.title}`)} />
//           ))
//         ) : (
//           <p>No events available.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default EventList;
