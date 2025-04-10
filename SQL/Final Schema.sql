
-- DROP DATABASE IF EXISTS event_management_db;

CREATE DATABASE event_management_db;

USE event_management_db;

-- CREATE TABLE STATEMENTS

CREATE TABLE users( 
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100),
    usn VARCHAR(20) UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('Student', 'Organizer', 'Supervisor') DEFAULT 'Student',
    total_points INT DEFAULT 0
);

CREATE TABLE clubs (
    club_id INT AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(100) NOT NULL,
    club_admin INT NOT NULL,
    club_description TEXT
);

CREATE TABLE user_clubs (
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, club_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE
);

CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    organizer_name VARCHAR(100) NOT NULL,
    club_id INT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    start_date_time DATETIME NOT NULL,
    end_date_time DATETIME NOT NULL,
    location_type ENUM('virtual', 'onCampus', 'offCampus') NOT NULL,
    location VARCHAR(200),
    max_participants INT NOT NULL,
    is_paid_event BOOLEAN DEFAULT FALSE,
    event_price DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id)
);

CREATE TABLE eventRegistration (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'waitlisted', 'cancelled') DEFAULT 'confirmed',
    ticket_type ENUM('free', 'paid') DEFAULT 'free',
    ticket_price DECIMAL(10,2) DEFAULT 0.00,
    is_payment_done BOOLEAN DEFAULT FALSE,  -- Added is_payment_done column here
    payment_reference VARCHAR(100) DEFAULT NULL,  -- Added payment_reference column here
    user_event_status ENUM('registered', 'attended') DEFAULT 'registered',
    qr_token VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    notification_type ENUM('eventUpdate', 'reminder', 'cancellation') NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);

CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);

CREATE TABLE badges (
    badge_id INT AUTO_INCREMENT PRIMARY KEY,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT NOT NULL,
    icon_url VARCHAR(255) NULL
);

CREATE TABLE user_badges (
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (badge_id) REFERENCES badges(badge_id)
);

CREATE VIEW leaderboard AS
SELECT user_id, user_name, total_points 
FROM users
ORDER BY total_points DESC
LIMIT 10;

 -- INSERT STATEMENTS

INSERT INTO clubs (club_name, club_admin, club_description) VALUES
('AI & Robotics Club', 101, 'A club dedicated to AI, machine learning, and robotics.'),
('Cybersecurity Club', 102, 'Focuses on ethical hacking, security research, and workshops.'),
('Art & Culture Club', 103, 'Promotes creativity through painting, music, and literature.'),
('Tech Innovators', 104, 'A club for students passionate about technology and innovation.'),
('Music & Performing Arts Club', 105, 'A club that celebrates music, drama, and performances.'),
('Environmental Club', 106, 'A club dedicated to sustainability, environmental awareness, and green initiatives.'),
('Coding Club', 107, 'A place for students to improve their programming and problem-solving skills.'),
('Photography Club', 108, 'Capturing moments, learning photography techniques, and holding exhibitions.');

INSERT INTO users (user_name, usn, password_hash, email, role, total_points) VALUES
('Pratham', 'USN1', 'hashed_password1', 'pratham@example.com', 'Student', 100),
('John', 'USN2', 'hashed_password2', 'john@example.com', 'Organizer', 150),
('Jane', 'USN3', 'hashed_password3', 'jane@example.com', 'Supervisor', 200),
('Alex', 'USN4', 'hashed_password4', 'alex@example.com', 'Student', 50),
('Mike', 'USN5', 'hashed_password5', 'mike@example.com', 'Student', 120),
('Emily', 'USN6', 'hashed_password6', 'emily@example.com', 'Organizer', 170),
('Sophia', 'USN7', 'hashed_password7', 'sophia@example.com', 'Supervisor', 220),
('David', 'USN8', 'hashed_password8', 'david@example.com', 'Student', 80),
('Ella', 'USN9', 'hashed_password9', 'ella@example.com', 'Student', 90);

INSERT INTO events (event_name, organizer_name, club_id, is_internal, start_date_time, end_date_time, location_type, location, max_participants, is_paid_event, event_price) VALUES
('AI & ML Workshop', 'AI & Robotics Club', 1, TRUE, '2024-03-10 10:00:00', '2024-03-10 12:00:00', 'onCampus', 'Auditorium A', 100, FALSE, 0.00),
('Robotics Hackathon', 'AI & Robotics Club', 1, TRUE, '2024-03-15 09:00:00', '2024-03-15 11:00:00', 'onCampus', 'Tech Lab', 100, TRUE, 500.00),
('Music Concert', 'Music & Performing Arts Club', 5, TRUE, '2024-04-01 18:00:00', '2024-04-01 20:00:00', 'onCampus', 'Auditorium B', 200, FALSE, 0.00),
('Environmental Awareness Seminar', 'Environmental Club', 6, TRUE, '2024-04-10 09:00:00', '2024-04-10 11:00:00', 'onCampus', 'Conference Room A', 100, FALSE, 0.00),
('Hackathon Challenge', 'Coding Club', 7, TRUE, '2024-04-12 08:00:00', '2024-04-13 20:00:00', 'onCampus', 'Lab 3', 150, TRUE, 300.00),
('Photography Workshop', 'Photography Club', 8, TRUE, '2024-04-15 10:00:00', '2024-04-15 12:00:00', 'onCampus', 'Room 201', 50, FALSE, 0.00);

INSERT INTO eventRegistration (user_id, event_id, status, ticket_type, ticket_price, is_payment_done, payment_reference) VALUES
(2, 1, 'confirmed', 'free', 0.00, FALSE, NULL),
(2, 2, 'confirmed', 'paid', 1.00, TRUE, 'PAY1234'),
(3, 3, 'confirmed', 'paid', 300.00, TRUE, 'PAY5678'),
(4, 2, 'waitlisted', 'free', 0.00, FALSE, NULL),
(5, 4, 'confirmed', 'free', 0.00, FALSE, NULL),
(1, 5, 'confirmed', 'paid', 300.00, TRUE, 'PAY9101'),
(2, 6, 'confirmed', 'free', 0.00, FALSE, NULL);

INSERT INTO notifications (user_id, event_id, title, message, notification_type, is_read) VALUES
(2, 1, 'Workshop Reminder', 'Don\'t forget the AI & ML Workshop tomorrow!', 'reminder', FALSE),
(3, 2, 'Event Update', 'The Robotics Hackathon has been rescheduled to a later date.', 'eventUpdate', FALSE),
(3, 3, 'Hackathon Challenge Update', 'The Hackathon Challenge is starting soon! Prepare for the coding challenge!', 'eventUpdate', FALSE),
(4, 2, 'Seminar Reminder', 'The Environmental Awareness Seminar is tomorrow at 9 AM.', 'reminder', FALSE),
(5, 4, 'Photography Workshop Confirmed', 'You have been successfully registered for the Photography Workshop!', 'eventUpdate', TRUE),
(1, 5, 'Music Concert Reminder', 'The Music Concert will be held tomorrow evening. See you there!', 'reminder', FALSE),
(2, 6, 'Event Cancellation', 'The Environmental Awareness Seminar has been cancelled due to unforeseen circumstances.', 'cancellation', TRUE);

INSERT INTO feedback (user_id, event_id, rating, comments) VALUES
(2, 1, 5, 'The workshop was amazing!'),
(3, 2, 4, 'Great event, but the timing was off.'),
(4, 3, 4, 'Great event but would have liked more time for coding.'),
(5, 4, 5, 'Excellent workshop! Learned a lot about photography!'),
(1, 2, 4, 'The seminar was informative but could be more interactive.');

INSERT INTO badges (badge_name, badge_description, icon_url) VALUES
('Rookie Star', 'Earned after scoring 50 points.', NULL),
('Rising Achiever', 'Earned after scoring 100 points.', NULL),
('Campus Champion', 'Earned after scoring 250 points.', NULL),
('Legend of Events', 'Earned after scoring 500 points.', NULL),
('Eternal Icon', 'Earned after scoring 1000 points.', NULL);

INSERT INTO user_badges (user_id, badge_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(2, 5);

INSERT INTO user_clubs (user_id, club_id) VALUES
(1, 1), -- Pratham -> AI & Robotics Club
(1, 2), -- Pratham -> Cybersecurity Club
(2, 1), -- John -> AI & Robotics Club
(2, 3), -- John -> Art & Culture Club
(3, 2), -- Jane -> Cybersecurity Club
(3, 4), -- Jane -> Tech Innovators
(4, 1), -- Alex -> AI & Robotics Club
(4, 4), -- Alex -> Tech Innovators
(5, 3), -- Unknown User -> Art & Culture Club
(2, 5), -- John -> Music & Performing Arts Club
(3, 6), -- Jane -> Environmental Club
(4, 7), -- Alex -> Coding Club
(5, 8), -- Ella -> Photography Club
(1, 6), -- Pratham -> Environmental Club
(3, 5); -- Sophia -> Music & Performing Arts Club


-- SELECT STATEMENTS

SELECT * FROM users;

SELECT * FROM clubs;

SELECT * FROM user_clubs;

SELECT * FROM events;

SELECT * FROM eventRegistration;

SELECT * FROM notifications;

SELECT * FROM feedback;

SELECT * FROM badges;

SELECT * FROM user_badges;

SELECT * FROM leaderboard;

COMMIT;