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
import { events, recommendedEvents } from './data';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [recommendedList, setRecommendedList] = useState([]);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    setEventList(events);
    setRecommendedList(recommendedEvents);
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const filteredUpcomingEvents = eventList.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!filter || event.category === filter)
  );

  const filteredRecommendedEvents = recommendedList.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!filter || event.category === filter)
  );

  return (
    <Container fluid>
      <Row className="mb-3">
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
              <DropdownItem onClick={() => setFilter('Workshop')}>Workshop</DropdownItem>
              <DropdownItem onClick={() => setFilter('Seminar')}>Seminar</DropdownItem>
              <DropdownItem onClick={() => setFilter('Conference')}>Conference</DropdownItem>
              <DropdownItem onClick={() => setFilter('Cultural Event')}>Cultural Event</DropdownItem>
              <DropdownItem onClick={() => setFilter('Club Event')}>Club Event</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Col>

        {userRole === 'Organizer' && (
          <Col md={4} className="text-end">
            <Button color="primary">Create Event</Button>
          </Col>
        )}
      </Row>

      <Row className="mb-5">
        {/* Upcoming Events Section */}
        <Col md={12}>
          <h3>Upcoming Events</h3>
          <Row>
            {filteredUpcomingEvents.map((event) => (
              <Col key={event.id} md={4} className="mb-4">
                <Card>
                  <CardBody>
                    <CardTitle>{event.title}</CardTitle>
                    <CardText>{event.category}</CardText>
                    <Button color="primary">View Details</Button>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      <Row className="mb-5">
        {/* Recommended Events Section */}
        <Col md={12}>
          <h3>Recommended Events</h3>
          <Row>
            {filteredRecommendedEvents.map((event) => (
              <Col key={event.id} md={4} className="mb-4">
                <Card>
                  <CardBody>
                    <CardTitle>{event.title}</CardTitle>
                    <CardText>{event.category}</CardText>
                    <Button color="primary">View Details</Button>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default LandingPage;
