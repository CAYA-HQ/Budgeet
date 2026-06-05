from django.core.mail import send_mail
from django.conf import settings


def send_welcome_email(user):
    """
    Sends a welcome email to a newly registered user.
    Called from the register view after user creation.
    """
    first_name = user.name.split()[0] if user.name else "there"

    subject = "Welcome to Budgeet "

    plain_message = f"""
Hi {first_name},

Welcome to Budgeet! Your account has been created successfully.

Here's what you can do right away:
  • Set your monthly budget
  • Log your first expense
  • Track your spending with insights

Visit your dashboard: http://localhost:5173/dashboard

Cheers,
The Budgeet Team
    """.strip()

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }}
    .container {{ max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }}
    .header {{ background: #000000; padding: 36px 40px; text-align: center; }}
    .header h1 {{ color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px; }}
    .header p {{ color: #888; margin: 8px 0 0; font-size: 14px; }}
    .body {{ padding: 36px 40px; }}
    .body h2 {{ font-size: 20px; color: #111; margin: 0 0 12px; }}
    .body p {{ color: #555; line-height: 1.6; font-size: 15px; margin: 0 0 20px; }}
    .steps {{ background: #f9f9f9; border-radius: 12px; padding: 20px 24px; margin: 0 0 28px; }}
    .steps p {{ margin: 0 0 10px; font-size: 14px; color: #333; }}
    .steps p:last-child {{ margin: 0; }}
    .steps span {{ margin-right: 8px; }}
    .btn {{ display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; }}
    .footer {{ padding: 20px 40px; border-top: 1px solid #f0f0f0; text-align: center; }}
    .footer p {{ color: #aaa; font-size: 12px; margin: 0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Budgeet</h1>
      <p>Smart personal finance tracking</p>
    </div>
    <div class="body">
      <h2>Welcome, {first_name}! </h2>
      <p>Your account is all set up. Here's how to get started:</p>
      <div class="steps">
        <p>• Set your <strong>monthly budget</strong></p>
        <p>• Log your <strong>first expense</strong></p>
        <p>• Check your <strong>spending insights</strong></p>
      </div>
      <a href="http://localhost:5173/dashboard" class="btn">Go to Dashboard →</a>
    </div>
    <div class="footer">
      <p>You're receiving this because you signed up for Budgeet.<br/>© 2026 Budgeet. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    """.strip()

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=True,   # Don't crash registration if email fails
        )
    except Exception as e:
        # Log but never block registration
        print(f"[Budgeet] Welcome email failed for {user.email}: {e}")
        