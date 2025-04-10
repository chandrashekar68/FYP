from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from connection import get_db_connection
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/gamification",
    tags=["Gamification"]
)

# Award Points to users
def award_points(user_id: int, event_id: int):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT user_event_status FROM eventRegistration WHERE user_id = %s AND event_id = %s", (user_id, event_id))
        user_event_status = cursor.fetchone()

        if not user_event_status:
            raise ValueError("User is not registered for this event")
        
        status = user_event_status[0]
        points_earned = 5 if status == "registered" else 10 if status == "attended" else 0

        cursor.execute("UPDATE users SET total_points = total_points + %s WHERE user_id = %s", (points_earned, user_id))

        cursor.execute("SELECT total_points FROM users WHERE user_id = %s", (user_id,))
        new_points = cursor.fetchone()[0]

        badge_thresholds = [
            (1, 50),
            (2, 100),
            (3, 250),
            (4, 500),
            (5, 1000),
        ]

        earned_badges = []
        for badge_id, threshold in badge_thresholds:
            if new_points >= threshold:
                cursor.execute("SELECT 1 FROM user_badges WHERE user_id = %s AND badge_id = %s", (user_id, badge_id))
                if not cursor.fetchone():
                    cursor.execute("INSERT INTO user_badges (user_id, badge_id) VALUES (%s, %s)", (user_id, badge_id))
                    earned_badges.append(badge_id)

        connection.commit()

        return {
            "message": f"✅ {points_earned} points awarded.",
            "badges": earned_badges
        }

    except Exception as e:
        connection.rollback()
        raise Exception(f"Error while awarding points: {str(e)}")
    finally:
        connection.close()

# Backend API to award points
@router.post("/add-points/{user_id}/{event_id}")
def add_points(user_id: int, event_id: int):
    return award_points(user_id, event_id)

# Get user points
@router.get("/points/{user_id}")
def get_user_points(user_id: int):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT total_points FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"total_points": user[0]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    finally:
        connection.close()


# Get leaderboard
@router.get("/leaderboard")
def get_leaderboard(limit: int = 10):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT user_id, user_name, total_points FROM users ORDER BY total_points DESC LIMIT %s", (limit,))
        results = cursor.fetchall()

        leaderboard = [{"user_id": r[0], "user_name": r[1], "total_points": r[2]} for r in results]
    
        return {"leaderboard": leaderboard}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    finally:
        connection.close()

@router.get("/badges/{user_id}")
def get_user_badges(user_id: int):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT b.badge_id, b.badge_name, b.badge_description, b.icon_url
            FROM user_badges ub
            JOIN badges b ON ub.badge_id = b.badge_id
            WHERE ub.user_id = %s
        """, (user_id,))
        
        badges = cursor.fetchall()
        badge_list = [{
            "badge_id": b[0],
            "badge_name": b[1],
            "badge_description": b[2],
            "icon_url": b[3]
        } for b in badges]

        return {"badges": badge_list}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching badges: {str(e)}")
    finally:
        connection.close()

        


