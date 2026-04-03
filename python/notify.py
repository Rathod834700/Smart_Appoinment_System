# python/notify.py
"""
Notification utilities
- send_email(smtp_config, to_email, subject, body)
- send_sms(sms_config, to_number, message)  # placeholder
- notify_console(message) prints to console
"""

import smtplib
from email.message import EmailMessage
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notify")

def send_email(smtp_config: dict, to_email: str, subject: str, body: str) -> bool:
    """
    smtp_config keys:
      - host
      - port
      - username
      - password
      - use_tls (bool)
      - from_email (optional)
    """
    host = smtp_config.get("host")
    port = smtp_config.get("port", 587)
    username = smtp_config.get("username")
    password = smtp_config.get("password")
    use_tls = smtp_config.get("use_tls", True)
    from_email = smtp_config.get("from_email", username)

    if not host or not username or not password:
        logger.error("SMTP config incomplete")
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.set_content(body)

    try:
        if use_tls:
            server = smtplib.SMTP(host, port, timeout=10)
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(host, port, timeout=10)
        server.login(username, password)
        server.send_message(msg)
        server.quit()
        logger.info("Email sent to %s", to_email)
        return True
    except Exception as e:
        logger.exception("Failed to send email: %s", e)
        return False

def send_sms(sms_config: dict, to_number: str, message: str) -> bool:
    """
    Placeholder for SMS sending. Integrate with Twilio, Nexmo, or other provider.
    Example sms_config for Twilio:
      { "provider": "twilio", "account_sid": "...", "auth_token": "...", "from": "+1..." }
    """
    provider = sms_config.get("provider")
    if provider == "twilio":
        try:
            from twilio.rest import Client
            client = Client(sms_config["account_sid"], sms_config["auth_token"])
            client.messages.create(body=message, from_=sms_config["from"], to=to_number)
            logger.info("SMS sent to %s via Twilio", to_number)
            return True
        except Exception as e:
            logger.exception("Twilio SMS failed: %s", e)
            return False
    # Fallback: log to console
    logger.info("SMS to %s: %s", to_number, message)
    return True

def notify_console(message: str):
    print("NOTIFICATION:", message)

if __name__ == "__main__":
    # quick demo
    smtp = {
        "host": "smtp.example.com",
        "port": 587,
        "username": "user@example.com",
        "password": "password",
        "use_tls": True,
        "from_email": "noreply@example.com"
    }
    # send_email(smtp, "recipient@example.com", "Test", "This is a test")  # uncomment after configuring
    notify_console("This is a demo notification")
