
import React, { useState } from 'react';
import { events, categories, recommendedEvents } from './data';
import EventList from './EventList';
import './StudentDashboard.css';

function StudentDashboard() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredEvents = selectedCategory
    ? events.filter((event) => event.category === selectedCategory)
    : events;

  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      
      <section className="filter-section">
        <h2>Filter by Category</h2>
        <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </section>

      <section>
        <EventList events={filteredEvents} title="All Events" />
      </section>

      <section>
        <EventList events={recommendedEvents} title="Recommended Events" />
      </section>
    </div>
  );
}

export default StudentDashboard;