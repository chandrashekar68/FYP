import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os

# Function to send emails
def send_email_for_added_event(to_email, club_name, event_title):
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_username = os.getenv("SMTP_USERNAME", "your-email@gmail.com")
    smtp_password = os.getenv("SMTP_PASSWORD", "your-email-password")

    subject = f"New Event Added for {club_name}"
    body = f"""
    Hello From SJCE Event Management System!

    A new event **"{event_title}"** has been added for **{club_name}**.

    Check it out now!

    Best Regards,
    SJCE Event Management Team
    """

    msg = MIMEMultipart()
    msg["From"] = smtp_username
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, to_email, msg.as_string())
        server.quit()
        print(f"✅ Email sent to {to_email} about {event_title}")
    except Exception as e:
        print(f"❌ Error sending email to {to_email}: {str(e)}")


def send_email_for_event_registration(to_email, user_id, event_id, qr_token=None):
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_username = os.getenv("SMTP_USERNAME", "your-email@gmail.com")
    smtp_password = os.getenv("SMTP_PASSWORD", "your-email-password")

    subject = "🎉 Event Registration Confirmation"

    qr_info = "\n🎟️ Your QR code is attached to this email.\nPlease scan it at the event venue to mark your attendance." if qr_token else "\nThis event does not require a QR code."

    body = f"""
    Hello from SJCE Event Management System! 👋

    Thank you for registering for the event ✅

    {qr_info}

    Best Regards,  
    SJCE Event Management Team
    """

    msg = MIMEMultipart()
    msg["From"] = smtp_username
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    # ✅ Attach QR Code Image if exists
    if qr_token:
        qr_path = f"qr_codes/qr_{user_id}_{event_id}.png"
        if os.path.exists(qr_path):
            with open(qr_path, "rb") as qr_file:
                img = MIMEImage(qr_file.read())
                img.add_header("Content-Disposition", "attachment", filename=os.path.basename(qr_path))
                msg.attach(img)

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, to_email, msg.as_string())
        server.quit()
        print(f"✅ Email sent to {to_email} with QR code.")
    except Exception as e:
        print(f"❌ Error sending email to {to_email}: {str(e)}")
