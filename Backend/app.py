from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from model import UserAuth, UserProfile, TokenRequest, Event, ClubRegistrationRequest, EventRegistrationRequest, Club, FeedbackRequest
from connection import get_db_connection
from smtp_config import send_email_for_added_event, send_email_for_event_registration
import os
import hashlib
import requests
import random
import string
from typing import List
from paypal import router as paypal_router
from gamification import award_points, router as gamification_router
from qr import generate_qr_token, router as qr_router
from datetime import datetime
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow all origins, you can restrict to specific domains if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include sub routes
app.include_router(paypal_router, tags=["PayPal"])
app.include_router(gamification_router)
app.include_router(qr_router)

@app.get("/")
def home():
    return {"message": "Hello World"}

@app.post("/add_club")
async def add_club(club: Club):
    try:
        # Establish connection to MySQL
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT user_id FROM users WHERE user_name = %s", (club.club_admin,))
        club_admin_id = cursor.fetchone()[0]

        # SQL query to insert data into clubs table
        sql_query = """
        INSERT INTO clubs (club_name, club_admin, club_description)
        VALUES (%s, %s, %s)
        """
        cursor.execute(sql_query, (club.club_name, club_admin_id, club.club_description))
        conn.commit()  # Commit the transaction

        return {"message": "Club added successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.post("/add_event")
async def add_event(event: Event):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        club_id = event.club_id

        cursor.execute(
            """
            INSERT INTO events (
                event_name, organizer_name, club_id, is_internal, start_date_time, 
                end_date_time, location_type, location, max_participants,
                is_paid_event, event_price, event_description
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                event.event_name, event.organizer_name, club_id, event.is_internal, 
                event.start_date_time, event.end_date_time, event.location_type, 
                event.location, event.max_participants,
                event.is_paid_event, event.event_price, event.event_description
            )
        )
        event_id = cursor.lastrowid
        connection.commit()

        # Fetch club name for notification
        cursor.execute("SELECT club_name FROM clubs WHERE club_id = %s", (club_id,))
        club = cursor.fetchone()
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        club_name = club[0]

        # Notify users
        cursor.execute("""
            SELECT users.user_id, users.email 
            FROM users 
            INNER JOIN user_clubs ON users.user_id = user_clubs.user_id
            WHERE user_clubs.club_id = %s
        """, (club_id,))
        users = cursor.fetchall()

        if not users:
            return {"message": f"Event '{event.event_name}' added, but no users to notify."}

        for user_id, email in users:
            message = f"{club_name} has added a new event!\n{event.event_name}. Check your email for QR Code which should be shown during attendance"
            cursor.execute("""
                INSERT INTO notifications (user_id, event_id, title, message, notification_type, is_read)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (user_id, event_id, event.event_name, message, "eventUpdate", False))

            send_email_for_added_event(email, club_name, event.event_name)

        connection.commit()
        return {"message": f"Event '{event.event_name}' added & notifications sent!"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding event: {str(e)}")

    finally:
        cursor.close()
        connection.close()

# Fetch Notifications    
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
    cursor.execute("""
        SELECT notification_id, title, message, notification_type, sent_at, is_read 
        FROM notifications 
        WHERE user_id = %s 
        ORDER BY sent_at DESC
    """, (user_id,))
    
    notifications = cursor.fetchall()
    cursor.close()
    connection.close()

    return {
        "unread_count": unread_count,
        "notifications": [
            {
                "id": n[0],
                "title": n[1],
                "message": n[2],
                "type": n[3],
                "sent_at": n[4].isoformat(),
                "is_read": n[5],
            }
            for n in notifications
        ],
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
    cursor.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = %s AND is_read = FALSE", (user_id,))
    connection.commit()

    cursor.close()
    connection.close()

    return {"message": "All notifications marked as read"}


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

# Get User Registered Events with Club Names
@app.get("/users/{email}/events")
async def get_user_events(email: str):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Get user ID
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    # Get all event details joined with registration and club
    query = """
        SELECT e.event_id, e.event_name, e.organizer_name, e.start_date_time, 
               e.end_date_time, e.location, e.club_id, c.club_name, e.is_paid_event, 
               e.event_price, e.event_description, er.user_event_status
        FROM events e 
        JOIN clubs c ON e.club_id = c.club_id
        JOIN eventRegistration er ON e.event_id = er.event_id
        WHERE er.user_id = %s
    """

    cursor.execute(query, (user_id,))
    events = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "events": [
            {
                "id": e[0],
                "title": e[1],
                "organizer": e[2],
                "start_date": e[3].isoformat() if e[3] else None,
                "end_date": e[4].isoformat() if e[4] else None,
                "location": e[5],
                "club_id": e[6],
                "club_name": e[7],
                "is_paid_event": e[8],
                "event_price": e[9],
                "event_description": e[10],
                "user_event_status": e[11]
            }
            for e in events
        ]
    }


# Get User Name to Check if he has already created the profile
@app.get("/get_user_name")
async def get_user_name(email: str):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Get user ID from email
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    cursor.execute("SELECT user_name FROM users WHERE user_id = %s", (user_id,))
    user_name = cursor.fetchone()

    cursor.close()
    connection.close()

    if user_name[0] == None:
        return {"user_name": ""}
    else:
        return {"user_name": user_name[0]}


# Get All Club Events of the User's Subscribed Clubs
@app.get("/users/{email}/available_events")
async def get_available_events(email: str):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Get user ID from email
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    # Get all clubs the user is subscribed to
    cursor.execute("SELECT club_id FROM user_clubs WHERE user_id = %s", (user_id,))
    subscribed_clubs = cursor.fetchall()

    if not subscribed_clubs:
        return {"message": "No clubs subscribed", "events": []}

    club_ids = [club[0] for club in subscribed_clubs]

    # Correctly format the SQL query
    format_strings = ','.join(['%s'] * len(club_ids))
    query = f"""
        SELECT e.event_id, e.event_name, e.organizer_name, e.start_date_time, 
               e.end_date_time, e.location, e.club_id, c.club_name, e.is_paid_event, e.event_price, e.event_description
        FROM events e 
        JOIN clubs c ON e.club_id = c.club_id
        WHERE e.club_id IN ({format_strings})
    """

    cursor.execute(query, tuple(club_ids))
    events = cursor.fetchall()
    
    cursor.close()
    connection.close()

    event_list = [
        {
            "id": event[0],
            "title": event[1],
            "organizer": event[2],
            "start_date": event[3].isoformat() if event[3] else None,
            "end_date": event[4].isoformat() if event[4] else None,
            "location": event[5],
            "club_id": event[6],
            "club_name": event[7],
            "is_paid_event": event[8],
            "event_price": float(event[9]),
            "event_description": event[10]
        }
        for event in events
    ]

    return {"events": event_list}



# Signup (Regular Users)
@app.post("/signup")
async def signup(user: UserAuth):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if email exists
    cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    existing_user = cursor.fetchone()

    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    # Hash the password
    hashed_password = hashlib.sha256(user.password.encode()).hexdigest()

    # Insert new user (Default role: 'student')
    cursor.execute(
        "INSERT INTO users (email, password_hash) VALUES (%s, %s)",
        (user.email, hashed_password)
    )
    connection.commit()

    cursor.close()
    connection.close()

    return {"message": "User created successfully"}

# Login (Regular Users)
@app.post("/login")
async def login(user: UserAuth):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Fetch user
    cursor.execute("SELECT email, password_hash FROM users WHERE email = %s", (user.email,))
    existing_user = cursor.fetchone()

    if not existing_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User does not exist")

    # Hash and compare passwords
    input_password_hash = hashlib.sha256(user.password.encode()).hexdigest()
    if input_password_hash != existing_user[1]:  # password_hash is in the 5th column
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    cursor.close()
    connection.close()

    return {"message": "Login successful"}

@app.post("/create-profile")
async def create_user_profile(request: UserProfile):
    body = request.dict()

    usn = body.get("usn")
    username = body.get("username")
    role = body.get("role")
    clubName = body.get("clubName")
    email = body.get("email")

    # Generate a random USN for organizer/supervisor if not provided
    if role in ["Organizer", "Supervisor"] and (not usn or usn.strip() == ""):
        random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        usn = f"{role[:3].upper()}-{random_suffix}"

    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if user exists
    cursor.execute("SELECT email FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()

    if not existing_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User does not exist")

    print("User Fetched")

    # Update user profile
    cursor.execute(
        "UPDATE users SET user_name = %s, usn = %s, role = %s WHERE email = %s",
        (username, usn, role, email)
    )

    print("Updated Users Table")

    connection.commit()
    cursor.close()
    connection.close()

    return {"message": "Profile updated successfully"}


# Google OAuth Login
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

# Google OAuth Signup
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

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (user_info["email"],))
        existing_user = cursor.fetchone()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        # Generate a random password and hash it using hashlib
        random_password = str(uuid.uuid4())
        hashed_password = hashlib.sha256(random_password.encode()).hexdigest()

        # Insert new user
        cursor.execute("INSERT INTO users (user_name, email, password_hash) VALUES (%s, %s, %s)", 
               ("", user_info["email"], hashed_password))
        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "Google Signup Successful"}

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
@app.get("/get_user_role")
def get_user_role(email: str):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT role FROM users WHERE email = %s", (email,))
        user_role = cursor.fetchone()

        print(user_role)

        if user_role is None:
            raise HTTPException(status_code=404, detail="User not found")

        return {"user_role": user_role[0]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user role: {str(e)}")

    finally:
        cursor.close()
        connection.close()

# Get all the Clubs in the Database
@app.get("/get_clubs")
async def get_clubs():
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("SELECT club_id, club_name FROM clubs")  # Fetch both columns
        clubs = cursor.fetchall()

        return {"clubs": [{"club_id": club[0], "club_name": club[1]} for club in clubs]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching clubs: {str(e)}")

    finally:
        cursor.close()
        connection.close()



# Register to a club using club name
@app.post("/users/{email}/register_club")
async def register_club(email: str, request: ClubRegistrationRequest):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Get user_id from email
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user[0]

        # Check if user is already registered in the club
        cursor.execute("SELECT * FROM user_clubs WHERE user_id = %s AND club_id = %s", (user_id, request.club_id))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="User already registered to the club")

        # Insert into user_clubs table
        cursor.execute("INSERT INTO user_clubs (user_id, club_id) VALUES (%s, %s)", (user_id, request.club_id))
        connection.commit()

        return {"message": f"Successfully registered {email} to {request.club_name}"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    finally:
        cursor.close()
        connection.close()

# Award points to users when they participate in events
@app.post("/users/{email}/events/{event_id}/earn_points")
async def earn_points(email: str, event_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Check if user exists
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]
    
    # Award points for participation
    points = 10  # Default points per event
    cursor.execute("UPDATE users SET points = points + %s WHERE user_id = %s", (points, user_id))
    connection.commit()
    
    cursor.close()
    connection.close()
    
    return {"message": f"User {email} earned {points} points for attending event {event_id}"}


# Get user points & badges
@app.get("/users/{email}/gamification")
async def get_user_gamification(email: str):
    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Get user details
    cursor.execute("SELECT user_id, points FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id, points = user
    
    # Fetch user badges
    cursor.execute("SELECT badge_name FROM badges WHERE user_id = %s", (user_id,))
    badges = [row[0] for row in cursor.fetchall()]
    
    cursor.close()
    connection.close()
    
    return {"points": points, "badges": badges}

# Get global leaderboard
@app.get("/leaderboard", response_model=List[dict])
async def get_leaderboard():
    connection = get_db_connection()
    cursor = connection.cursor()
    
    cursor.execute("SELECT name, points FROM users ORDER BY points DESC LIMIT 10")
    leaderboard = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    return [{"name": row[0], "points": row[1]} for row in leaderboard]

@app.post("/users/{email}/register_event")
async def register_event(email: str, payload: EventRegistrationRequest):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Step 1: Get user ID
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user[0]

        # Step 2: Check if already registered for the event
        cursor.execute("SELECT * FROM eventRegistration WHERE user_id = %s AND event_id = %s", (user_id, payload.event_id))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Already registered for the event")

        # Step 3: Check event details
        cursor.execute("SELECT is_paid_event, event_price, location_type FROM events WHERE event_id = %s", (payload.event_id,))
        event = cursor.fetchone()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        is_paid_event, event_price, location_type = event

        # Step 4: Payment logic
        is_payment_done = False
        payment_reference = None

        if is_paid_event:
            if not payload.payment_reference:
                raise HTTPException(status_code=400, detail="Payment required but no reference provided")
            is_payment_done = True
            payment_reference = payload.payment_reference

        # Step 5: Generate QR token if offline event
        qr_token = None
        if location_type != "virtual":
            try:
                qr_token = generate_qr_token(user_id, payload.event_id)
            except Exception:
                raise HTTPException(status_code=500, detail="QR generation failed")


        # Step 6: Insert into registration table
        cursor.execute(
            """
            INSERT INTO eventRegistration (user_id, event_id, is_payment_done, payment_reference, qr_token)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (user_id, payload.event_id, is_payment_done, payment_reference, qr_token)
        )
        connection.commit()

        # Step 7: Send confirmation email with QR (if generated)
        send_email_for_event_registration(email, user_id, payload.event_id, qr_token)

        try:
            result = award_points(user_id, payload.event_id)
            print(result["message"])
        except Exception as e:
            print("Points awarding failed:", str(e))

        return {"message": "Successfully registered for event"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    
    finally:
        cursor.close()
        connection.close()

@app.post("/users/{email}/submit_feedback")
async def submit_feedback(email: str, request: FeedbackRequest):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Get user_id from email
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user[0]

        # Check if user is registered for the event
        cursor.execute(
            "SELECT * FROM eventRegistration WHERE user_id = %s AND event_id = %s",
            (user_id, request.event_id),
        )
        registration = cursor.fetchone()
        if not registration:
            raise HTTPException(status_code=400, detail="User not registered for this event")
        
        cursor.execute(
            "SELECT * FROM feedback WHERE user_id = %s AND event_id = %s",
            (user_id, request.event_id)
        )
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Feedback already submitted.")


        # Insert feedback with formatted datetime
        feedback_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute(
            """
            INSERT INTO feedback (user_id, event_id, rating, comments, feedback_date)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (user_id, request.event_id, request.rating, request.comments, feedback_date),
        )

        # Get event name safely
        cursor.execute("SELECT event_name FROM events WHERE event_id = %s", (request.event_id,))
        event_name = cursor.fetchone()
        event_name_str = event_name[0] if event_name else "Unknown Event"

        connection.commit()

        return {"message": f"Feedback submitted successfully for event {event_name_str}"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    finally:
        cursor.close()
        connection.close()

@app.get("/get_clubs")
def get_clubs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT club_id, club_name FROM clubs")
        clubs = cursor.fetchall()

        return {"clubs": clubs}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

docker_host = "0.0.0.0"
local_host = "127.0.0.1"

if __name__ == "__main__":
    uvicorn.run("app:app", host=local_host, port=8000, reload=True)