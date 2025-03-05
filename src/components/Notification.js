import React, { useState, useEffect } from "react";

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    
    // Get userEmail from localStorage
    const userEmail = localStorage.getItem("userEmail");

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!userEmail) return; // Ensure userEmail exists
        try {
            const response = await fetch(`http://localhost:8000/users/${userEmail}/notifications`);
            if (!response.ok) throw new Error("Failed to fetch notifications");
            const data = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    // Mark notifications as read
    const markAsRead = async () => {
        if (!userEmail) return;
        try {
            await fetch(`http://localhost:8000/users/${userEmail}/notifications/mark_read`, { method: "POST" });
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    // Fetch notifications when component mounts
    useEffect(() => {
        if (userEmail) fetchNotifications();
    }, [userEmail]); // Runs when userEmail changes

    // Toggle dropdown
    const toggleDropdown = () => {
        if (!isOpen) {
            fetchNotifications();
            markAsRead();
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="notification-container">
            <div className="bell-icon" onClick={toggleDropdown}>
                <svg id="notification-bell" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 24c1.104 0 2-.896 2-2h-4c0 1.104.896 2 2 2zm8-6v-5c0-3.532-2.612-6.432-6-6.923V4c0-.828-.672-1.5-1.5-1.5S11 3.172 11 4v.077C7.612 4.568 5 7.468 5 11v5l-2 2v1h18v-1l-2-2z" />
                </svg>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>
            {isOpen && (
                <ul className="notification-dropdown">
                    {notifications.length === 0 ? <li>No new notifications</li> : notifications.map((notif) => <li key={notif.id}>{notif.message}</li>)}
                </ul>
            )}
        </div>
    );
};

export default Notification;
