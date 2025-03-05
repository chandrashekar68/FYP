from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from model import User, TokenRequest
from connection import get_db_connection
from smtp_config import send_email
import os
import hashlib
import requests
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, you can restrict to specific domains if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def home():
    return {"message": "Hello World"}

# Endpoint to add an event and notify users
@app.post("/add_event")
async def add_event(title: str, description: str, event_date: str, location: str, club_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Insert event into database
        cursor.execute(
            "INSERT INTO events (title, description, event_date, location, club_id) VALUES (%s, %s, %s, %s, %s)",
            (title, description, event_date, location, club_id),
        )
        event_id = cursor.lastrowid
        connection.commit()

        # Fetch club name
        cursor.execute("SELECT name FROM clubs WHERE id = %s", (club_id,))
        club = cursor.fetchone()
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        club_name = club[0]

        # Fetch all users subscribed to this club
        cursor.execute("SELECT u.user_id, u.email FROM users u JOIN user_clubs uc ON u.user_id = uc.user_id WHERE uc.club_id = %s", (club_id,))
        users = cursor.fetchall()

        # Insert notifications for each user
        for user in users:
            user_id, email = user
            message = f"{club_name} has added a new event!\n {title}" 
            cursor.execute("INSERT INTO notifications (user_id, event_id, message) VALUES (%s, %s, %s)", (user_id, event_id, message))
            send_email(email, club_name, title)  # Send email notification

        connection.commit()
        cursor.close()
        connection.close()

        return {"message": f"Event '{title}' added & notifications sent!"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding event: {str(e)}")
    
@app.get("/users/{email}/notifications")
async def get_notifications(email: str):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Get user ID
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    # Get unread notifications count
    cursor.execute("SELECT COUNT(*) FROM notifications WHERE user_id = %s AND is_read = FALSE", (user_id,))
    unread_count = cursor.fetchone()[0]

    # Fetch notifications
    cursor.execute("SELECT id, message, is_read FROM notifications WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
    notifications = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "unread_count": unread_count,
        "notifications": [{"id": n[0], "message": n[1], "is_read": n[2]} for n in notifications]
    }


@app.post("/users/{email}/notifications/mark_read")
async def mark_notifications_read(email: str):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Get user ID
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    # Mark all notifications as read
    cursor.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = %s", (user_id,))
    connection.commit()

    cursor.close()
    connection.close()

    return {"message": "Notifications marked as read"}


@app.get("/users/{email}/clubs", response_model=List[dict])
async def get_user_clubs(email: str):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Get user ID
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    # Get clubs
    cursor.execute("""
        SELECT c.id, c.name, c.description 
        FROM clubs c
        JOIN user_clubs uc ON c.id = uc.club_id
        WHERE uc.user_id = %s
    """, (user_id,))
    clubs = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    return [{"id": c[0], "name": c[1], "description": c[2]} for c in clubs]

@app.get("/users/{email}/events", response_model=List[dict])
async def get_user_events(email: str):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Get user ID
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    # Get club IDs
    cursor.execute("SELECT club_id FROM user_clubs WHERE user_id = %s", (user_id,))
    club_ids = [row[0] for row in cursor.fetchall()]
    
    if not club_ids:
        print("Could not fetch Club ID")
        return []

    # Convert list into a tuple for safe SQL execution
    format_strings = ','.join(['%s'] * len(club_ids))
    query = f"""
        SELECT id, title, description, event_date, location, club_id
        FROM events
        WHERE club_id IN ({format_strings})
    """
    
    cursor.execute(query, tuple(club_ids))
    events = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    return [{
        "id": e[0],
        "title": e[1],
        "description": e[2],
        "date": e[3].isoformat() if e[3] else None,
        "location": e[4],
        "club_id": e[5]
    } for e in events]



# Signup route (for regular users)
@app.post("/signup")
async def signup(user: User):
    connection = get_db_connection()
    cursor = connection.cursor()

    # print(user)

    # Simple SQL query to check if the email already exists
    cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    # Hash the password before saving it to the database
    hashed_password = hashlib.sha256(user.password.encode()).hexdigest()

    # Insert new user into database
    cursor.execute("INSERT INTO users (user_name, email, password) VALUES (%s, %s, %s)", 
                   (user.username, user.email, hashed_password))
    connection.commit()

    cursor.close()
    connection.close()

    return {"message": "User created successfully"}


# Login route (for regular users)
@app.post("/login")
async def login(user: User):
    connection = get_db_connection()
    cursor = connection.cursor()

    # print(user)

    # Check if the user exists and the password matches
    cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    existing_user = cursor.fetchone()

    # print("before checking user exists")

    if not existing_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User does not exist")
    
    # print("after checking user exists")

    # Hash the input password and compare it
    input_password_hash = hashlib.sha256(user.password.encode()).hexdigest()

    # print("before checking pass hash")

    # print("Existing User: ")
    # print(existing_user)

    if input_password_hash != existing_user[3]:  # Assuming password is the third column
        # print(f"Pass hash: {input_password_hash}")
        # print(existing_user[3])
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    print("after checking pass hash")
    
    cursor.close()
    connection.close()

    return {"message": "Login successful"}


# Google OAuth Signup/Login
@app.post("/auth/google-login")
async def google_login(request: TokenRequest):
    token = request.token
    if not token:
        raise HTTPException(status_code=400, detail="No token provided")

    user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    try:
        response = requests.get(user_info_url, headers={"Authorization": f"Bearer {token}"})
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")

        user_info = response.json()

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (user_info["email"],))
        existing_user = cursor.fetchone()

        if not existing_user:
            # Create new user in database
            cursor.execute("INSERT INTO users (username, email) VALUES (%s, %s)", 
                           (user_info["name"], user_info["email"]))
            connection.commit()

        cursor.close()
        connection.close()

        # Return user info or JWT token after successful OAuth
        return JSONResponse(content=user_info)

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/auth/google-signup")
async def google_signup(request: TokenRequest):
    token = request.token
    if not token:
        raise HTTPException(status_code=400, detail="No token provided")

    user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    try:
        response = requests.get(user_info_url, headers={"Authorization": f"Bearer {token}"})
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")

        user_info = response.json()

        print("hi 1")

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (user_info["email"],))
        existing_user = cursor.fetchone()

        print("hi 2")

        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        print("hi 3")

        # Create new user
        cursor.execute("INSERT INTO users (user_name, email) VALUES (%s, %s)", 
                       (user_info["name"], user_info["email"]))
        connection.commit()

        print("hi 4")

        cursor.close()
        connection.close()

        print("hi 5")

        return {"message": "Google Signup Successful"}

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
