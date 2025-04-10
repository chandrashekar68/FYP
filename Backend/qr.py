from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from fastapi import File, UploadFile
from pyzbar.pyzbar import decode
from PIL import Image
from connection import get_db_connection
import qrcode
import os
import uuid
from gamification import award_points

router = APIRouter()

QR_FOLDER = "qr_codes"
os.makedirs(QR_FOLDER, exist_ok=True)

def generate_qr_token(user_id: int, event_id: int):
    token = str(uuid.uuid4())
    qr_data = f"{user_id}:{event_id}:{token}"
    qr_filename = f"{QR_FOLDER}/qr_{user_id}_{event_id}.png"

    qr = qrcode.make(qr_data)
    qr.save(qr_filename)

    return token

@router.post("/generate_qr/{user_id}/{event_id}")
def generate_qr(user_id: int, event_id: int):
    try:
        token = generate_qr_token(user_id, event_id)
        return {"qr_token": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_qr/{user_id}/{event_id}")
def get_qr(user_id: int, event_id: int):
    qr_path = f"{QR_FOLDER}/qr_{user_id}_{event_id}.png"
    if os.path.exists(qr_path):
        return FileResponse(path=qr_path, media_type='image/png')
    raise HTTPException(status_code=404, detail="QR code not found")


@router.post("/confirm_attendance/{user_id}/{event_id}")
def confirm_attendance(user_id: int, event_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            UPDATE eventRegistration
            SET user_event_status = 'attended'
            WHERE user_id = %s AND event_id = %s
        """, (user_id, event_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Registration not found")

        connection.commit()
        return {"message": "✅ Attendance confirmed"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"❌ Error: {str(e)}")

    finally:
        cursor.close()
        connection.close()

@router.post("/scan_qr_image")
async def scan_qr_image(file: UploadFile = File(...)):
    try:
        image = Image.open(file.file)
        decoded_data = decode(image)

        if not decoded_data:
            raise HTTPException(status_code=400, detail="❌ No QR code detected.")

        qr_text = decoded_data[0].data.decode("utf-8")
        user_id, event_id, token = qr_text.split(":")

        # 🧠 Same attendance update logic
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE eventRegistration
            SET user_event_status = 'attended'
            WHERE user_id = %s AND event_id = %s
        """, (user_id, event_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Registration not found")

        connection.commit()

        try:
            result = award_points(user_id, event_id)
            print(result["message"])
        except Exception as e:
            print("Points awarding failed:", str(e))
    
        return {"message": f"✅ Attendance confirmed for user {user_id}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Error decoding/processing QR: {str(e)}")
    finally:
        cursor.close()
        connection.close()
