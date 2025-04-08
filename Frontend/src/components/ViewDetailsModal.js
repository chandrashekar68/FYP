import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert } from "reactstrap";
import axios from "axios";

const ViewDetailsModal = ({ isOpen, toggle, event, userEmail }) => {
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paypalWindowRef, setPaypalWindowRef] = useState(null);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.status === "success") {
        alert("Payment successful! You are now registered for the event.");
        toggle();
        setPaymentProcessing(false);
        window.location.reload();
        if (paypalWindowRef) paypalWindowRef.close();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [paypalWindowRef, toggle]);

  const handlePayAndRegister = async () => {
    if (!event) return;
    setPaymentProcessing(true);
    setPaymentError(null);

    try {
      const { data } = await axios.post("http://localhost:8000/paypal/create-payment", {
        event_id: event.id,
        user_email: userEmail,
      });

      const approvalUrl = data.approval_url;

      if (!approvalUrl) {
        setPaymentError("Unable to initiate PayPal payment.");
        setPaymentProcessing(false);
        return;
      }

      const paypalWindow = window.open(approvalUrl, "_blank", "width=600,height=700");
      setPaypalWindowRef(paypalWindow);

      const checkClosed = setInterval(() => {
        if (paypalWindow?.closed) {
          clearInterval(checkClosed);
          setPaymentProcessing(false);
        }
      }, 1000);
    } catch (err) {
      setPaymentError("Error initiating payment. Try again.");
      setPaymentProcessing(false);
    }
  };

  const handleRegister = async () => {
    if (!event) return;
    setPaymentProcessing(true);
    try {
      await axios.post(`http://localhost:8000/users/${userEmail}/register_event`, {
        event_id: event.id,
      });
      alert("Successfully registered!");
      toggle();
      window.location.reload();
    } catch (err) {
      setPaymentError("Error registering for the event.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (!event) return null;

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
        <p><strong>Event Price:</strong> {event.event_price > 0 ? `$${event.event_price}` : "Free"}</p>

        {paymentError && (
          <Alert color="danger" fade={false}>
            {paymentError}
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={event.is_paid_event ? handlePayAndRegister : handleRegister}
          disabled={paymentProcessing}
        >
          {paymentProcessing
            ? "Processing..."
            : event.is_paid_event
              ? "Pay & Register"
              : "Register"}
        </Button>
        <Button color="secondary" onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewDetailsModal;
