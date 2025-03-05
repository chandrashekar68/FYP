
-- Insertions
-- Insert into Club
INSERT INTO Club (club_name, club_admin, club_description)
VALUES ('Tech Club', 1, 'A club for tech enthusiasts.');

-- Insert into User
INSERT INTO User (user_name, password_hash, email, role, club_id)
VALUES ('John Doe', 'hashed_password', 'john.doe@example.com', 'member', 1);

-- Insert into Event
INSERT INTO Event (event_name, organizer_name, club_id, is_internal, start_date_time, end_date_time, location_type, location, max_participants)
VALUES ('Tech Meetup', 'Tech Club', 1, TRUE, '2024-12-25 10:00:00', '2024-12-25 14:00:00', 'onCampus', 'Main Auditorium', 100);

-- Insert into EventRegistration
INSERT INTO EventRegistration (user_id, event_id, ticket_type, ticket_price)
VALUES (1, 1, 'free', 0.00);

-- Insert into Feedback
INSERT INTO Feedback (user_id, event_id, rating, comments)
VALUES (1, 1, 5, 'Amazing event!');

-- Insert into Notification
INSERT INTO Notification (user_id, event_id, title, message, notification_type)
VALUES (1, 1, 'Welcome', 'Thank you for registering.', 'reminder');
