-- NEEEEEEEWWWWWWWWWWWWWWWWWWWW

SHOW tables;

SELECT * FROM clubs;
DESC clubs;

CREATE TABLE clubs (
    club_id INT AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(100) NOT NULL,
    club_admin INT NOT NULL,
    club_description TEXT
);

INSERT INTO clubs (club_id, club_name, club_admin, club_description) VALUES
(1, 'AI & Robotics Club', 101, 'A club dedicated to AI, machine learning, and robotics.'),
(2, 'Cybersecurity Club', 102, 'Focuses on ethical hacking, security research, and workshops.'),
(3, 'Art & Culture Club', 103, 'Promotes creativity through painting, music, and literature.'),
(4, 'Tech Innovators', 104, 'A club for students passionate about technology and innovation.');


DROP TABLE clubs;

describe users;

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


SELECT * FROM users;

DROP TABLE users;

SELECT * FROM events;

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

UPDATE users SET club_id = 1 WHERE user_id = 2;

INSERT INTO events (event_name, organizer_name, club_id, is_internal, start_date_time, end_date_time, location_type, location, max_participants) VALUES
('AI & ML Workshop', 'AI & Robotics Club', 1, TRUE, '2024-03-10 10:00:00', '2024-03-10 12:00:00', 'onCampus', 'Auditorium A', 100),
('Robotics Hackathon', 'AI & Robotics Club', 1, TRUE, '2024-03-15 09:00:00', '2024-03-15 11:00:00', 'onCampus', 'Tech Lab', 100),
('Ethical Hacking Bootcamp', 'Cybersecurity Club', 2, TRUE, '2024-03-12 14:00:00', '2024-03-12 16:00:00', 'onCampus', 'Hall B', 100),
('Cybersecurity Awareness Seminar', 'Cybersecurity Club', 2, TRUE, '2024-03-20 16:00:00', '2024-03-20 18:00:00', 'onCampus', 'Lecture Hall 1', 100),
('Poetry Slam Night', 'Art & Culture Club', 3, TRUE, '2024-03-18 18:00:00', '2024-03-18 20:00:00', 'onCampus', 'Cultural Hall', 100),
('Painting Exhibition', 'Art & Culture Club', 3, TRUE, '2024-03-22 11:00:00', '2024-03-22 13:00:00', 'onCampus', 'Art Gallery', 100),
('Future of Blockchain', 'Tech Innovators', 4, TRUE, '2024-03-25 13:00:00', '2024-03-25 15:00:00', 'onCampus', 'Innovation Center', 100),
('IoT Workshop', 'Tech Innovators', 4, TRUE, '2024-03-28 10:00:00', '2024-03-28 12:00:00', 'onCampus', 'Lab 3', 100),
('noti_test_1', 'Cybersecurity Club', 2, TRUE, '2024-03-10 10:00:00', '2024-03-10 12:00:00', 'onCampus', 'home', 100),
('noti_test_2', 'Cybersecurity Club', 2, TRUE, '2024-03-22 11:00:00', '2024-03-22 13:00:00', 'onCampus', 'here', 100),
('noti_test_3', 'Cybersecurity Club', 2, TRUE, '2024-03-10 10:00:00', '2024-03-10 12:00:00', 'onCampus', 'herer', 100),
('noti_test_3', 'Cybersecurity Club', 2, TRUE, '2024-03-10 10:00:00', '2024-03-10 12:00:00', 'onCampus', 'herer', 100);

DROP TABLE events;

SELECT * FROM events;

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

INSERT INTO eventRegistration (user_id, event_id, status, ticket_type, ticket_price) VALUES
(2, 1, 'confirmed', 'free', 0.00),
(2, 2, 'confirmed', 'paid', 500.00);


INSERT INTO eventRegistration (user_id, event_id, status, ticket_type, ticket_price) VALUES
(1, 1, 'confirmed', 'free', 0.00),
(2, 2, 'confirmed', 'paid', 500.00),
(3, 3, 'waitlisted', 'free', 0.00),
(4, 4, 'cancelled', 'paid', 300.00),
(5, 5, 'confirmed', 'free', 0.00),
(1, 6, 'confirmed', 'paid', 250.00),
(2, 7, 'waitlisted', 'free', 0.00),
(3, 8, 'confirmed', 'free', 0.00),
(4, 9, 'cancelled', 'paid', 100.00),
(5, 10, 'confirmed', 'paid', 200.00);


SELECT * FROM eventRegistration;

DROP TABLE eventRegistration;

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



DROP TABLE notifications;

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

DROP TABLE feedback;


DESC users;

