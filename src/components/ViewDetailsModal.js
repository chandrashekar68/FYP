import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import axios from "axios";

const ViewDetailsModal = ({ isOpen, toggle, event, userEmail }) => {
  if (!event) return null;

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/users/${userEmail}/register_event`,
        { event_id: event.id }
      );
      alert(response.data.message);
      toggle();
    } catch (error) {
      alert(error.response?.data?.detail || "Error registering for event");
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{event.title}</ModalHeader>
      <ModalBody>
        <p><strong>Club:</strong> {event.club_name}</p>
        <p><strong>Organizer:</strong> {event.organizer}</p>
        <p><strong>Start:</strong> {new Date(event.start_date).toLocaleString()}</p>
        <p><strong>End:</strong> {new Date(event.end_date).toLocaleString()}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Description:</strong> {event.description}</p>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleRegister}>Register</Button>
        <Button color="secondary" onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewDetailsModal;
