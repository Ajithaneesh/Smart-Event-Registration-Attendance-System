export async function sendOtpEmail(toEmail, otpCode, eventName = 'SERAS') {
  try {
    const response = await fetch('http://localhost:3001/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: toEmail,
        otp: otpCode,
        eventName: eventName
      })
    });
    
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error || 'SMTP server rejected request');
    }
    return true;
  } catch (err) {
    console.error('sendOtpEmail utility error:', err);
    throw new Error(err.message || 'Could not connect to SMTP server');
  }
}
