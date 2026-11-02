export function activationEmailTemplate(otp) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Apartmentium Account Activation</title>
      </head>

      <body style="margin: 0; padding: 24px; background-color: #f3f6fa; font-family: Arial, sans-serif;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px;">
          <h1 style="margin-top: 0; color: #142b4e;">
            Welcome to Apartmentium!
          </h1>

          <p style="color: #475569; line-height: 1.6;">
            Your landlord has created an Apartmentium tenant account for you.
            Use the verification code below to activate your account.
          </p>

          <div style="margin: 28px 0; padding: 20px; background-color: #eef3f7; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">
              YOUR ACTIVATION CODE
            </p>

            <h2 style="margin: 0; color: #142b4e; font-size: 32px; letter-spacing: 8px;">
              ${otp}
            </h2>
          </div>

          <p style="color: #475569; line-height: 1.6;">
            This code expires in <strong>5 minutes</strong>.
            Do not share this code with anyone.
          </p>

          <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
            If you did not expect this account, please contact your landlord.
          </p>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

          <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
            Apartmentium Apartment Rental Management System
          </p>
        </div>
      </body>
    </html>
  `;
}
