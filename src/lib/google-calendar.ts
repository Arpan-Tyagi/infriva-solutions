/**
 * @file src/lib/google-calendar.ts
 * @description Google Calendar API v3 Automated Follow-Up Reminder Integration
 *
 * Implements delegated user token execution with custom notification overrides
 * (email: 30m, popup: 10m). Avoids the service account phantom calendar pitfall.
 */

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startTime: string; // ISO-8601
  endTime: string;   // ISO-8601
  attendeeEmail: string;
  repEmail: string;
}

/**
 * Inserts a follow-up calendar event with custom notification overrides.
 */
export async function scheduleGoogleCalendarReminder(
  event: CalendarEventPayload,
  userOAuthAccessToken?: string
) {
  // If no user token passed or mock mode
  if (!userOAuthAccessToken) {
    return {
      success: true,
      eventId: `mock_gcal_${Date.now()}`,
      htmlLink: 'https://calendar.google.com/calendar',
      mock: true,
      message: 'Delegated Google OAuth2 token not provided; reminder simulated.',
    };
  }

  const calendarBody = {
    summary: event.summary,
    description: event.description,
    start: {
      dateTime: event.startTime,
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: event.endTime,
      timeZone: 'Asia/Kolkata',
    },
    attendees: [
      { email: event.attendeeEmail },
      { email: event.repEmail },
    ],
    // Explicit reminder overrides for sales representative
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 30 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userOAuthAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarBody),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err };
    }

    const data = await res.json();
    return {
      success: true,
      eventId: data.id,
      htmlLink: data.htmlLink,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
