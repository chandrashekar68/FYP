import React, { useState } from "react";
import axios from "axios";
import "../styles/FeedbackForm.css";

const FeedbackForm = ({ event, userEmail, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (rating === 0 || comments.trim() === "") return;

    setIsSubmitting(true);
    try {
      await axios.post(`http://localhost:8000/users/${userEmail}/submit_feedback`, {
        email: userEmail,
        event_id: event.id,
        rating,
        comments,
      });
      setMessage("✅ Feedback submitted successfully!");
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inline-feedback-box">
      <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Rate this event:</p>
      <div className="stars">
        {[...Array(5)].map((_, index) => {
          const value = index + 1;
          return (
            <span
              key={index}
              className={`star ${value <= (hover || rating) ? "filled" : ""}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              title={`${value} Star${value > 1 ? "s" : ""}`}
            >
              ★
            </span>
          );
        })}
      </div>

      <textarea
        placeholder="What did you think about this event? Be honest :)"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        rows="4"
      />

      <button
        disabled={rating === 0 || comments.trim() === "" || isSubmitting}
        onClick={handleSubmit}
        className="submit-btn"
      >
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </button>

      {message && <p className="feedback-msg">{message}</p>}
    </div>
  );
};

export default FeedbackForm;
