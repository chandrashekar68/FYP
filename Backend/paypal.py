from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import paypalrestsdk
import logging
from connection import get_db_connection
from model import CreatePaymentRequest

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


# === Helper Functions ===
def get_event_price(event_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT event_price FROM events WHERE event_id = %s", (event_id,))
        result = cursor.fetchone()
        return float(result[0]) if result else None
    except Exception as e:
        logger.error(f"[DB ERROR] Failed to fetch event price: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching event price.")
    finally:
        cursor.close()
        conn.close()

def get_user_id_by_email(email: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        result = cursor.fetchone()
        return result[0] if result else None
    except Exception as e:
        logger.error(f"[DB ERROR] Failed to fetch user_id: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching user.")
    finally:
        cursor.close()
        conn.close()

# === Routes ===

@router.post("/paypal/create-payment")
def create_payment(data: CreatePaymentRequest):
    try:
        # PAYPAL CONFIGURATION
        paypalrestsdk.set_config(
            mode="sandbox",
            client_id=os.environ.get('PAYPAL_CLIENT_ID'),
            client_secret=os.environ.get('PAYPAL_SECRET')
        )

        price = get_event_price(data.event_id)
        if price is None:
            raise HTTPException(status_code=404, detail="Event not found.")

        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": f"http://localhost:8000/paypal/execute-payment?user_email={data.user_email}&event_id={data.event_id}",
                "cancel_url": "http://localhost:8000/payment/cancelled"
            },
            "transactions": [{
                "amount": {
                    "total": f"{price:.2f}",
                    "currency": "USD"
                },
                "description": f"Payment for Event #{data.event_id}"
            }]
        })

        if payment.create():
            for link in payment.links:
                if link.rel == "approval_url":
                    return {"approval_url": link.href}
            raise HTTPException(status_code=500, detail="No approval URL found.")
        else:
            logger.error(f"[PAYPAL ERROR] {payment.error}")
            raise HTTPException(status_code=400, detail="Failed to create PayPal payment.")
    except Exception as e:
        logger.error(f"[ERROR] Unexpected error during payment creation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during payment creation.")

@router.get("/paypal/execute-payment")
def execute_payment(
    paymentId: str = Query(...),
    PayerID: str = Query(...),
    user_email: str = Query(...),
    event_id: int = Query(...)
):
    try:
        payment = paypalrestsdk.Payment.find(paymentId)

        if not payment.execute({"payer_id": PayerID}):
            logger.error(f"[PAYPAL EXECUTE ERROR] {payment.error}")
            raise HTTPException(status_code=500, detail=f"Payment execution failed: {payment.error}")

        capture_id = payment.transactions[0].related_resources[0].sale.id
        amount_paid = payment.transactions[0].amount.total

        user_id = get_user_id_by_email(user_email)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found.")

        # Insert into eventRegistration table
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO eventRegistration (user_id, event_id, ticket_type, ticket_price, is_payment_done, payment_reference)
            VALUES (%s, %s, 'paid', %s, TRUE, %s)
        """, (user_id, event_id, amount_paid, capture_id))
        conn.commit()

        # Send Succesful Payment Message + Close the Paypal Window
        html_content = f"""
        <html>
          <head>
            <script>
              window.opener.postMessage({{
                status: "success",
                eventId: {event_id}
              }}, "*");
              window.close();
            </script>
          </head>
          <body>
            <h3>Payment successful! You may close this window.</h3>
          </body>
        </html>
        """
        return HTMLResponse(content=html_content)

    except HTTPException as e:
        raise e
    finally:
        cursor.close()
        conn.close()
