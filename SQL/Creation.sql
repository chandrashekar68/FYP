-- Create Database
CREATE DATABASE IF NOT EXISTS EventManageDB;
USE EventManageDB;

-- Table: Club
CREATE TABLE Club (
    club_id INT AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(100) NOT NULL,
    club_admin INT NOT NULL,
    club_description TEXT
);

-- Table: User
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'member', 'guest') DEFAULT 'member',
    club_id INT,
    FOREIGN KEY (club_id) REFERENCES Club(club_id)
);

-- Table: Event
CREATE TABLE Event (
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
    FOREIGN KEY (club_id) REFERENCES Club(club_id)
);

-- Table: EventRegistration
CREATE TABLE EventRegistration (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'waitlisted', 'cancelled') DEFAULT 'confirmed',
    ticket_type ENUM('free', 'paid') DEFAULT 'free',
    ticket_price DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (event_id) REFERENCES Event(event_id)
);

-- Table: Notification
CREATE TABLE Notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    notification_type ENUM('eventUpdate', 'reminder', 'cancellation') NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (event_id) REFERENCES Event(event_id)
);

-- Table: Feedback
CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (event_id) REFERENCES Event(event_id)
);

-- View: ClubMembers
CREATE VIEW ClubMembers AS
SELECT 
    u.user_id, 
    u.user_name, 
    u.email, 
    c.club_name
FROM User u
INNER JOIN Club c ON u.club_id = c.club_id;

-- View: EventSummary
CREATE VIEW EventSummary AS
SELECT 
    e.event_id, 
    e.event_name, 
    e.organizer_name, 
    c.club_name, 
    e.start_date_time, 
    e.end_date_time, 
    e.location_type, 
    e.max_participants
FROM Event e
INNER JOIN Club c ON e.club_id = c.club_id;

-- Trigger: UpdateClubMemberCount
DELIMITER //
CREATE TRIGGER UpdateClubMemberCount
AFTER INSERT ON User
FOR EACH ROW
BEGIN
    UPDATE Club
    SET club_admin = club_admin + 1
    WHERE club_id = NEW.club_id;
END //
DELIMITER ;

-- Trigger: LogEventCancellation
DELIMITER //
CREATE TRIGGER LogEventCancellation
AFTER UPDATE ON EventRegistration
FOR EACH ROW
BEGIN
    IF NEW.status = 'cancelled' THEN
        INSERT INTO Notification (user_id, event_id, title, message, notification_type, sent_at)
        VALUES (NEW.user_id, NEW.event_id, 'Registration Cancelled', 'Your event registration has been cancelled.', 'cancellation', NOW());
    END IF;
END //
DELIMITER ;

-- Stored Procedure: RegisterUser
DELIMITER //
CREATE PROCEDURE RegisterUser(
    IN p_userName VARCHAR(100),
    IN p_passwordHash VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_role ENUM('admin', 'member', 'guest'),
    IN p_clubId INT
)
BEGIN
    INSERT INTO User (user_name, password_hash, email, role, club_id)
    VALUES (p_userName, p_passwordHash, p_email, p_role, p_clubId);
END //
DELIMITER ;

-- Stored Procedure: CreateEvent
DELIMITER //
CREATE PROCEDURE CreateEvent(
    IN p_eventName VARCHAR(100),
    IN p_organizerName VARCHAR(100),
    IN p_clubId INT,
    IN p_isInternal BOOLEAN,
    IN p_startDateTime DATETIME,
    IN p_endDateTime DATETIME,
    IN p_locationType ENUM('virtual', 'onCampus', 'offCampus'),
    IN p_location VARCHAR(200),
    IN p_maxParticipants INT
)
BEGIN
    IF EXISTS (SELECT 1 FROM Club WHERE club_id = p_clubId) THEN
        INSERT INTO Event (event_name, organizer_name, club_id, is_internal, start_date_time, end_date_time, location_type, location, max_participants)
        VALUES (p_eventName, p_organizerName, p_clubId, p_isInternal, p_startDateTime, p_endDateTime, p_locationType, p_location, p_maxParticipants);
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Club does not exist';
    END IF;
END //
DELIMITER ;

-- Stored Procedure: NotifyEventUpdate
DELIMITER //
CREATE PROCEDURE NotifyEventUpdate(
    IN p_eventId INT,
    IN p_title VARCHAR(200),
    IN p_message TEXT
)
BEGIN
    INSERT INTO Notification (user_id, event_id, title, message, notification_type, sent_at)
    SELECT 
        er.user_id, p_eventId, p_title, p_message, 'eventUpdate', NOW()
    FROM 
        EventRegistration er
    WHERE 
        er.event_id = p_eventId;
END //
DELIMITER ;

-- Stored Procedure: CancelEvent
DELIMITER //
CREATE PROCEDURE CancelEvent(
    IN p_eventId INT
)
BEGIN
    -- Update Registration Status
    UPDATE EventRegistration
    SET status = 'cancelled'
    WHERE event_id = p_eventId;

    -- Notify Users
    INSERT INTO Notification (user_id, event_id, title, message, notification_type, sent_at)
    SELECT 
        user_id, p_eventId, 'Event Cancelled', 'The event has been cancelled.', 'cancellation', NOW()
    FROM 
        EventRegistration
    WHERE 
        event_id = p_eventId;

    -- Delete Eventfor this datbaase gi
    DELETE FROM Event WHERE event_id = p_eventId;
END //
DELIMITER ;

-- Insertion Queries

-- Insert into Club
INSERT INTO Club (club_name, club_admin, club_description) VALUES 
('Tech Club', 1, 'A club for tech enthusiasts.'),
('Art Club', 2, 'A club for art lovers.');

-- Insert into User
INSERT INTO User (user_name, password_hash, email, role, club_id) VALUES 
('Alice', 'hashed_password_1', 'alice@example.com', 'member', 1),
('Bob', 'hashed_password_2', 'bob@example.com', 'admin', 2);

-- Insert into Event
INSERT INTO Event (event_name, organizer_name, club_id, is_internal, start_date_time, end_date_time, location_type, location, max_participants) VALUES 
('Tech Conference', 'Alice', 1, TRUE, '2023-10-01 09:00:00', '2023-10-01 17:00:00', 'onCampus', 'Main Hall', 100),
('Art Exhibition', 'Bob', 2, FALSE, '2023-11-01 10:00:00', '2023-11-01 18:00:00', 'offCampus', 'Art Gallery', 50);

-- Insert into EventRegistration
INSERT INTO EventRegistration (user_id, event_id, registration_date, status, ticket_type, ticket_price) VALUES 
(1, 1, NOW(), 'confirmed', 'free', 0.00),
(2, 2, NOW(), 'waitlisted', 'paid', 10.00);

-- Insert into Notification
INSERT INTO Notification (user_id, event_id, title, message, notification_type, sent_at) VALUES 
(1, 1, 'Event Reminder', 'Don\'t forget about the Tech Conference!', 'reminder', NOW()),
(2, 2, 'Event Update', 'The Art Exhibition has been rescheduled.', 'eventUpdate', NOW());

-- Insert into Feedback
INSERT INTO Feedback (user_id, event_id, rating, comments, feedback_date) VALUES 
(1, 1, 5, 'Great event!', NOW()),
(2, 2, 4, 'Very interesting exhibition.', NOW());
