"""
Email notification service
Sends appointment confirmation to patient via Gmail
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


def send_appointment_email(
    patient_name: str,
    patient_email: str,
    doctor: str,
    ward: str,
    slot: str,
    fee: int,
):
    try:
        sender   = os.getenv("EMAIL_SENDER")
        password = os.getenv("EMAIL_PASSWORD")

        if not sender or not password:
            print("[Email] Missing EMAIL_SENDER or EMAIL_PASSWORD in .env")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"✅ Appointment Confirmed - {doctor}"
        msg["From"]    = sender
        msg["To"]      = patient_email

        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f3f4f6;">
            <div style="background: #0d9488; padding: 24px 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🏥 Appointment Confirmed!</h1>
                <p style="color: #ccfbf1; margin: 8px 0 0 0; font-size: 14px;">AI Hospital Receptionist</p>
            </div>

            <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                <p style="color: #374151; font-size: 16px;">Dear <strong>{patient_name}</strong>,</p>
                <p style="color: #6b7280; font-size: 14px;">Your appointment has been successfully booked. Here are your details:</p>

                <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 8px; overflow: hidden;">
                    <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 14px 16px; color: #6b7280; font-size: 14px; width: 40%;">👨‍⚕️ Doctor</td>
                        <td style="padding: 14px 16px; color: #111827; font-weight: bold; font-size: 14px;">{doctor}</td>
                    </tr>
                    <tr style="background: #ffffff; border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 14px 16px; color: #6b7280; font-size: 14px;">🏥 Ward</td>
                        <td style="padding: 14px 16px; color: #111827; font-weight: bold; font-size: 14px;">{ward}</td>
                    </tr>
                    <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 14px 16px; color: #6b7280; font-size: 14px;">🕐 Time Slot</td>
                        <td style="padding: 14px 16px; color: #111827; font-weight: bold; font-size: 14px;">{slot}</td>
                    </tr>
                    <tr style="background: #ffffff;">
                        <td style="padding: 14px 16px; color: #6b7280; font-size: 14px;">💰 Consultation Fee</td>
                        <td style="padding: 14px 16px; color: #0d9488; font-weight: bold; font-size: 16px;">₹{fee}</td>
                    </tr>
                </table>

                <div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 16px; margin-top: 8px;">
                    <p style="color: #065f46; margin: 0; font-size: 14px;">
                        ⏰ Please arrive <strong>15 minutes early</strong> with a valid ID proof.
                    </p>
                </div>

                <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 16px; margin-top: 12px;">
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                        📋 Bring any previous medical reports or prescriptions if available.
                    </p>
                </div>

                <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 16px;">
                    This is an automated message from AI Hospital Receptionist.<br/>
                    Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.sendmail(sender, patient_email, msg.as_string())

        print(f"[Email] ✅ Confirmation sent to {patient_email}")
        return True

    except Exception as e:
        print(f"[Email Error] {e}")
        return False
