-- NEEEEEEEWWWWWWWWWWWWWWWWWWWW

CREATE DATABASE IF NOT EXISTS event_management_db;
USE event_management_db;

-- 1. Create parent tables first
CREATE TABLE clubs (
    club_id INT AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(100) NOT NULL,
    club_admin INT NOT NULL,
    club_description TEXT
);

CREATE TABLE users( 
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100),
    usn VARCHAR(20) UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('Student', 'Organizer', 'Supervisor') DEFAULT 'Student',
    club_id INT NULL,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id)
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

CREATE TABLE event_points (
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    points INT NOT NULL DEFAULT 0,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);

-- Add total_points column to users table
ALTER TABLE users ADD COLUMN total_points INT DEFAULT 0;

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

CREATE TABLE user_clubs (
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, club_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE
);

-- 2. Add new columns and change schema (latest changes)
ALTER TABLE events
ADD COLUMN is_paid_event BOOLEAN DEFAULT FALSE,
ADD COLUMN event_price DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE eventRegistration
ADD COLUMN is_payment_done BOOLEAN DEFAULT FALSE;

ALTER TABLE eventRegistration
ADD COLUMN payment_reference VARCHAR(100) DEFAULT NULL;

-- 3. Create views and triggers
CREATE VIEW leaderboard AS
SELECT user_id, user_name, total_points 
FROM users
ORDER BY total_points DESC
LIMIT 10;

DELIMITER //
CREATE TRIGGER update_user_points
AFTER INSERT ON eventRegistration
FOR EACH ROW
BEGIN
    UPDATE users
    SET points = points + NEW.points_earned
    WHERE user_id = NEW.user_id;
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER award_badge_for_5_events
AFTER INSERT ON eventRegistration
FOR EACH ROW
BEGIN
    DECLARE event_count INT;
    SELECT COUNT(*) INTO event_count FROM eventRegistration WHERE user_id = NEW.user_id;
    
    IF event_count = 5 THEN
        INSERT INTO userBadges (user_id, badge_id)
        VALUES (NEW.user_id, (SELECT badge_id FROM badges WHERE badge_name = 'Event Enthusiast'));
    END IF;
END;
//
DELIMITER ;

-- 4. Insert sample data into the tables
INSERT INTO clubs (club_id, club_name, club_admin, club_description) VALUES
(1, 'AI & Robotics Club', 101, 'A club dedicated to AI, machine learning, and robotics.'),
(2, 'Cybersecurity Club', 102, 'Focuses on ethical hacking, security research, and workshops.'),
(3, 'Art & Culture Club', 103, 'Promotes creativity through painting, music, and literature.'),
(4, 'Tech Innovators', 104, 'A club for students passionate about technology and innovation.');

INSERT INTO users (user_name, usn, password_hash, email, role, club_id) VALUES
('John Doe', 'USN001', 'hashed_password_1', 'john@example.com', 'Student', 1),
('Jane Smith', 'USN002', 'hashed_password_2', 'jane@example.com', 'Student', 1),
('Mark Brown', 'USN003', 'hashed_password_3', 'mark@example.com', 'Organizer', 2),
('Emily White', 'USN004', 'hashed_password_4', 'emily@example.com', 'Supervisor', 4),
('Alice Black', 'USN005', 'hashed_password_5', 'alice@example.com', 'Student', 3);

-- Assign club to users
UPDATE users SET club_id = 1 WHERE user_id = 2;

-- Insert events
INSERT INTO events (event_name, organizer_name, club_id, is_internal, start_date_time, end_date_time, location_type, location, max_participants) VALUES
('AI & ML Workshop', 'AI & Robotics Club', 1, TRUE, '2024-03-10 10:00:00', '2024-03-10 12:00:00', 'onCampus', 'Auditorium A', 100),
('Robotics Hackathon', 'AI & Robotics Club', 1, TRUE, '2024-03-15 09:00:00', '2024-03-15 11:00:00', 'onCampus', 'Tech Lab', 100),
('Ethical Hacking Bootcamp', 'Cybersecurity Club', 2, TRUE, '2024-03-12 14:00:00', '2024-03-12 16:00:00', 'onCampus', 'Hall B', 100),
('Cybersecurity Awareness Seminar', 'Cybersecurity Club', 2, TRUE, '2024-03-20 16:00:00', '2024-03-20 18:00:00', 'onCampus', 'Lecture Hall 1', 100),
('Poetry Slam Night', 'Art & Culture Club', 3, TRUE, '2024-03-18 18:00:00', '2024-03-18 20:00:00', 'onCampus', 'Cultural Hall', 100),
('Painting Exhibition', 'Art & Culture Club', 3, TRUE, '2024-03-22 11:00:00', '2024-03-22 13:00:00', 'onCampus', 'Art Gallery', 100),
('Future of Blockchain', 'Tech Innovators', 4, TRUE, '2024-03-25 13:00:00', '2024-03-25 15:00:00', 'onCampus', 'Innovation Center', 100),
('IoT Workshop', 'Tech Innovators', 4, TRUE, '2024-03-28 10:00:00', '2024-03-28 12:00:00', 'onCampus', 'Lab 3', 100);

-- Insert registrations
INSERT INTO eventRegistration (user_id, event_id, status, ticket_type, ticket_price) VALUES
(2, 1, 'confirmed', 'free', 0.00),
(2, 2, 'confirmed', 'paid', 500.00);

-- Insert notifications and feedback
INSERT INTO notifications (user_id, event_id, title, message, notification_type, is_read) VALUES
(2, 1, 'Event Reminder', 'Reminder: Don\'t forget the AI & ML Workshop tomorrow!', 'reminder', FALSE);

INSERT INTO feedback (user_id, event_id, rating, comments) VALUES
(1, 1, 5, 'Great workshop on AI!');

-- Insert badges
INSERT INTO badges (badge_name, badge_description, icon_url) VALUES
('Event Enthusiast', 'Attended 5 events', 'https://example.com/event_enthusiast.png'),
('Super Organizer', 'Organized 3 events', 'https://example.com/super_organizer.png'),
('Tech Guru', 'Attended 3 tech-related events', 'https://example.com/tech_guru.png');

-- Insert user-club relationships
INSERT INTO user_clubs (user_id, club_id) VALUES
(1, 1), -- Pratham2 -> AI & Robotics Club
(1, 2), -- Pratham2 -> Cybersecurity Club
(2, 1), -- Pratham Naveen Malangi -> AI & Robotics Club
(2, 3), -- Pratham Naveen Malangi -> Art & Culture Club
(3, 2), -- Pratham Again -> Cybersecurity Club
(3, 4), -- Pratham Again -> Tech Innovators
(4, 1), -- Pratham Naveen Malangi -> AI & Robotics Club
(4, 4), -- Pratham Naveen Malangi -> Tech Innovators
(5, 3); -- Unknown User -> Art & Culture Club

-- 5. Drop the club_id column from users (as per your last change)
ALTER TABLE users DROP COLUMN club_id;
