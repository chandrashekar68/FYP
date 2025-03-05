
-- Executing Stored Procedures
-- Execute RegisterUser Procedure
CALL RegisterUser('Jane Smith', 'secure_hash', 'jane.smith@example.com', 'member', 1);

-- Execute CreateEvent Procedure
CALL CreateEvent('AI Workshop', 'Tech Club', 1, FALSE, '2025-01-15 09:00:00', '2025-01-15 17:00:00', 'onCampus', 'Room 101', 50);

-- Execute NotifyEventUpdate Procedure
CALL NotifyEventUpdate(1, 'Schedule Change', 'The event time has been updated.');

-- Execute CancelEvent Procedure
CALL CancelEvent(1);

-- Query Views
-- View ClubMembers
SELECT * FROM ClubMembers;

-- View EventSummary
SELECT * FROM EventSummary;

-- Trigger Tests
-- Insert User to trigger UpdateClubMemberCount
INSERT INTO User (user_name, password_hash, email, role, club_id)
VALUES ('Alice Doe', 'hashed_password', 'alice.doe@example.com', 'member', 1);

-- Update Registration to trigger LogEventCancellation
UPDATE EventRegistration
SET
