import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Function to send emails
def send_email(to_email, club_name, event_title):
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
