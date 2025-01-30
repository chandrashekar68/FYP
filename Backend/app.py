from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from model import User, TokenRequest
from connection import get_db_connection
import os
import hashlib
import requests

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
