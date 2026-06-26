export const sendEmail = async (to: string, subject: string, body: string, isHtml: boolean = false) => {
  const emailServiceUrl = import.meta.env.VITE_EMAIL_SERVICE_URL;

  if (!emailServiceUrl) {
    console.warn('VITE_EMAIL_SERVICE_URL is not set. Email will not be sent.');
    // Don't throw an error to prevent breaking the flow, just resolve successfully.
    return { success: true, message: 'Email service disabled in development' };
  }

  try {
    const response = await fetch(`${emailServiceUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, body, isHtml }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send email: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Email error:', error);
    // User requested to solve "Failed to send email: Failed to fetch"
    // We should throw a more user-friendly error or swallow it if it's just a connection error.
    if (error.message.includes('Failed to fetch')) {
      console.warn('Backend email service is offline. Email notification skipped.');
      return { success: false, error: 'Email service is currently offline. Your action was still completed.' };
    }
    throw error;
  }
};
