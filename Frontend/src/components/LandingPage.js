import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "reactstrap";
import { Card, CardBody, CardTitle, CardText } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Chatbot from "./Chatbot";
import ViewDetailsModal from "./ViewDetailsModal"; // Import the modal component
import "../styles/Chatbot.css";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
      fetchAvailableEvents(storedEmail);
      fetchUserEvents(storedEmail);
    }
  }, []);

  const fetchAvailableEvents = async (email) => {
    try {
      const { data } = await axios.get(
        `http://localhost:8000/users/${email}/available_events`
      );
      setAvailableEvents(data.events);
    } catch (error) {
      console.error("Error fetching available events:", error);
      setAvailableEvents([]);
    }
  };

  const fetchUserEvents = async (email) => {
    try {
      const { data } = await axios.get(
        `http://localhost:8000/users/${email}/events`
      );
      setRegisteredEvents(data.events);
    } catch (error) {
      console.error("Error fetching registered events:", error);
      setRegisteredEvents([]);
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const handleSearch = (e) => setSearchQuery(e.target.value);
  const toggleChatbot = () => setIsChatbotOpen(!isChatbotOpen);
  const toggleModal = () => setModalOpen(!modalOpen);
  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const filterEvents = (events) =>
    events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!filter || event.category === filter)
    );

  return (
    <div className="landing-container">
      <Row className="mb-3 justify-content-center">
        <Col md={8} className="d-flex">
          <InputGroup className="me-2 w-100">
            <Input
              type="text"
              placeholder="Search for events..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </InputGroup>
          <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
            <DropdownToggle caret>Filter Events</DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setFilter("")}>All</DropdownItem>
              <DropdownItem onClick={() => setFilter("Workshop")}>
                Workshop
              </DropdownItem>
              <DropdownItem onClick={() => setFilter("Seminar")}>
                Seminar
              </DropdownItem>
              <DropdownItem onClick={() => setFilter("Conference")}>
                Conference
              </DropdownItem>
              <DropdownItem onClick={() => setFilter("Cultural Event")}>
                Cultural Event
              </DropdownItem>
              <DropdownItem onClick={() => setFilter("Club Event")}>
                Club Event
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Col>
      </Row>

      {/* All Available Events */}
      {availableEvents.length > 0 && (
        <Row className="mb-5">
          <Col md={12}>
            <h3>All Available Events</h3>
            <Row>
              {filterEvents(availableEvents).map((event) => (
                <Col key={event.id} md={4} className="mb-4">
                  <Card>
                    <CardBody>
                      <CardTitle>{event.title}</CardTitle>
                      <CardText>
                        <strong>Club:</strong> {event.club_name}
                      </CardText>
                      <CardText>
                        <strong>Organizer:</strong> {event.organizer}
                      </CardText>
                      <CardText>
                        <strong>Start:</strong>{" "}
                        {new Date(event.start_date).toLocaleString()}
                      </CardText>
                      <CardText>
                        <strong>End:</strong>{" "}
                        {new Date(event.end_date).toLocaleString()}
                      </CardText>
                      <CardText>
                        <strong>Location:</strong> {event.location}
                      </CardText>
                      {/* Display whether the event is paid or not */}
                      <CardText>
                        <strong>Payment Status:</strong>{" "}
                        {event.is_paid_event ? "Paid" : "Free"}
                      </CardText>
                      <Button color="primary" onClick={() => handleViewDetails(event)}>
                        View Details
                      </Button>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}

      {/* Registered Events */}
      {registeredEvents.length > 0 && (
        <Row className="mb-5">
          <Col md={12}>
            <h3>Registered Events</h3>
            <Row>
              {filterEvents(registeredEvents).map((event) => (
                <Col key={event.id} md={4} className="mb-4">
                  <Card>
                    <CardBody>
                      <CardTitle>{event.title}</CardTitle>
                      <CardText>
                        <strong>Club:</strong> {event.club_name}
                      </CardText>
                      <CardText>
                        <strong>Organizer:</strong> {event.organizer}
                      </CardText>
                      <CardText>
                        <strong>Start:</strong>{" "}
                        {new Date(event.start_date).toLocaleString()}
                      </CardText>
                      <CardText>
                        <strong>End:</strong>{" "}
                        {new Date(event.end_date).toLocaleString()}
                      </CardText>
                      <CardText>
                        <strong>Location:</strong> {event.location}
                      </CardText>
                      {/* Display whether the event is paid or not */}
                      <CardText>
                        <strong>Payment Status:</strong>{" "}
                        {event.is_paid_event ? "Paid" : "Free"}
                      </CardText>
                      <Button color="primary" onClick={() => handleViewDetails(event)}>
                        View Details
                      </Button>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}

      {/* Chatbot */}
      <div className="chatbot-container">
        <button className="chatbot-button" onClick={toggleChatbot}>
          {isChatbotOpen ? "×" : "+"}
        </button>
        {isChatbotOpen && <Chatbot />}
      </div>

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={modalOpen}
        toggle={toggleModal}
        event={selectedEvent}
        userEmail={userEmail}
      />
    </div>
  );
};

export default LandingPage;
