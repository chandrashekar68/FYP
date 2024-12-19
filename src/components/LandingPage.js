import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  InputGroup,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { Card, CardBody, CardTitle, CardText } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const LandingPage = ({ userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [events, setEvents] = useState([]); // Mock events list

  useEffect(() => {
    // Fetch events from the backend (mocked for now)
    const mockEvents = [
      { id: 1, title: 'Tech Talk', description: 'Learn the latest in tech.', category: 'Technical' },
      { id: 2, title: 'Cultural Fest', description: 'Experience diverse cultures.', category: 'Cultural' },
      { id: 3, title: 'Workshop on AI', description: 'Dive into AI development.', category: 'Workshop' },
    ];
    setEvents(mockEvents);
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!filter || event.category === filter)
  );

  return (
    <Container>
      <Container fluid>
          <Row className="mb-3">
          {/* Search Bar and Filter */}
          <Col md={8} className="d-flex">
            <InputGroup className="me-2">
              <Input
                type="text"
                placeholder="Search for upcoming events..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </InputGroup>
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle caret>Filter Events</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => setFilter('')}>All</DropdownItem>
                <DropdownItem onClick={() => setFilter('Technical')}>Technical</DropdownItem>
                <DropdownItem onClick={() => setFilter('Cultural')}>Cultural</DropdownItem>
                <DropdownItem onClick={() => setFilter('Workshop')}>Workshop</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Col>

          {/* Create Event Button */}
          {userRole === 'Organizer' && (
            <Col md={4} className="text-end">
              <Button color="primary">Create Event</Button>
            </Col>
          )}
        </Row>
      </Container>
      <Container fluid>
        <Row>
          {/* Left Side Panel */}
          <Col md={3} className="bg-light p-3">
            <h5>Recommended</h5>
            <ul>
              <li>Top Events</li>
              <li>Events Near You</li>
              <li>Trending</li>
            </ul>

            <h5 className="mt-4">Categories</h5>
            <ul>
              <li>Technical</li>
              <li>Cultural</li>
              <li>Workshops</li>
            </ul>
          </Col>

          {/* Main Body with Event Cards */}
          <Col md={9}>
            <Row>
              {filteredEvents.map((event) => (
                <Col key={event.id} md={4} className="mb-4">
                  <Card>
                    <CardBody>
                      <CardTitle>{event.title}</CardTitle>
                      <CardText>{event.description}</CardText>
                      <Button color="primary">View Details</Button>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default LandingPage;
