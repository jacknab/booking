import Twilio from "twilio";
import { storage } from "./storage";
import type { SmsSettings, AppointmentWithDetails } from "@shared/schema";
import { formatInTimeZone } from "date-fns-tz";

// Global Twilio client using company credentials
function getGlobalTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }
  return {
    client: Twilio(accountSid, authToken),
    fromNumber,
  };
}

function getTwilioClient(settings: SmsSettings) {
  if (!settings.twilioAccountSid || !settings.twilioAuthToken) {
    return null;
  }
  return Twilio(settings.twilioAccountSid, settings.twilioAuthToken);
}

function interpolateTemplate(
  template: string,
  vars: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

export async function sendSms(
  storeId: number,
  phone: string,
  body: string,
  messageType: string,
  appointmentId?: number,
  customerId?: number
): Promise<{ success: boolean; sid?: string; error?: string }> {
  // Check store has available tokens
  const store = await storage.getStore(storeId);
  if (!store) {
    return { success: false, error: "Store not found" };
  }

  if ((store.smsTokens ?? 0) < 1) {
    return { success: false, error: "Insufficient SMS tokens" };
  }

  // Get global Twilio credentials
  const twilioConfig = getGlobalTwilioClient();
  if (!twilioConfig) {
    return { success: false, error: "SMS service not configured" };
  }

  try {
    const message = await twilioConfig.client.messages.create({
      body,
      from: twilioConfig.fromNumber,
      to: phone,
    });

    // Deduct 1 token from store on successful send
    await storage.updateStore(storeId, { 
      smsTokens: Math.max(0, (store.smsTokens ?? 0) - 1)
    });

    await storage.createSmsLog({
      storeId,
      appointmentId: appointmentId ?? null,
      customerId: customerId ?? null,
      phone,
      messageType,
      messageBody: body,
      status: "sent",
      twilioSid: message.sid,
      errorMessage: null,
      sentAt: new Date(),
    });

    return { success: true, sid: message.sid };
  } catch (err: any) {
    const errorMessage = err.message || "Unknown error";
    await storage.createSmsLog({
      storeId,
      appointmentId: appointmentId ?? null,
      customerId: customerId ?? null,
      phone,
      messageType,
      messageBody: body,
      status: "failed",
      twilioSid: null,
      errorMessage,
      sentAt: new Date(),
    });

    console.error(`SMS send failed for store ${storeId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendBookingConfirmation(
  appointment: AppointmentWithDetails
): Promise<void> {
  if (!appointment.customer?.phone || !appointment.storeId) return;

  const settings = await storage.getSmsSettings(appointment.storeId);
  if (!settings?.bookingConfirmationEnabled) return;

  const timezone = appointment.store?.timezone || "UTC";
  const template =
    settings.confirmationTemplate ||
    "Hi {customerName}, your appointment at {storeName} is confirmed for {appointmentDate} at {appointmentTime}. See you then!";

  const body = interpolateTemplate(template, {
    customerName: appointment.customer?.name || "there",
    storeName: appointment.store?.name || "our salon",
    appointmentDate: formatInTimeZone(
      appointment.date,
      timezone,
      "EEEE, MMMM d"
    ),
    appointmentTime: formatInTimeZone(
      appointment.date,
      timezone,
      "h:mm a"
    ),
    serviceName: appointment.service?.name || "your service",
  });

  await sendSms(
    appointment.storeId,
    appointment.customer.phone,
    body,
    "booking_confirmation",
    appointment.id,
    appointment.customer.id
  );
}

export async function sendAppointmentReminder(
  appointment: AppointmentWithDetails
): Promise<void> {
  if (!appointment.customer?.phone || !appointment.storeId) return;

  const settings = await storage.getSmsSettings(appointment.storeId);
  if (!settings?.reminderEnabled) return;

  const existing = await storage.getSmsLogByAppointmentAndType(
    appointment.id,
    "reminder"
  );
  if (existing) return;

  const timezone = appointment.store?.timezone || "UTC";
  const template =
    settings.reminderTemplate ||
    "Hi {customerName}, this is a reminder of your appointment at {storeName} tomorrow at {appointmentTime}. Reply STOP to opt out.";

  const body = interpolateTemplate(template, {
    customerName: appointment.customer?.name || "there",
    storeName: appointment.store?.name || "our salon",
    appointmentDate: formatInTimeZone(
      appointment.date,
      timezone,
      "EEEE, MMMM d"
    ),
    appointmentTime: formatInTimeZone(
      appointment.date,
      timezone,
      "h:mm a"
    ),
    serviceName: appointment.service?.name || "your service",
  });

  await sendSms(
    appointment.storeId,
    appointment.customer.phone,
    body,
    "reminder",
    appointment.id,
    appointment.customer.id
  );
}

export async function sendReviewRequest(
  appointment: AppointmentWithDetails
): Promise<void> {
  if (!appointment.customer?.phone || !appointment.storeId) return;

  const settings = await storage.getSmsSettings(appointment.storeId);
  if (!settings?.reviewRequestEnabled || !settings.googleReviewUrl) return;

  const existing = await storage.getSmsLogByAppointmentAndType(
    appointment.id,
    "review_request"
  );
  if (existing) return;

  const template =
    settings.reviewTemplate ||
    "Hi {customerName}, thank you for visiting {storeName}! We'd love your feedback. Leave us a review: {reviewUrl}";

  const body = interpolateTemplate(template, {
    customerName: appointment.customer?.name || "there",
    storeName: appointment.store?.name || "our salon",
    reviewUrl: settings.googleReviewUrl,
  });

  await sendSms(
    appointment.storeId,
    appointment.customer.phone,
    body,
    "review_request",
    appointment.id,
    appointment.customer.id
  );
}

let reminderIntervalId: ReturnType<typeof setInterval> | null = null;

export function startReminderScheduler(): void {
  if (reminderIntervalId) return;

  console.log("[SMS] Reminder scheduler started (checks every 5 minutes)");

  reminderIntervalId = setInterval(async () => {
    try {
      await processReminders();
      await processReviewRequests();
    } catch (err) {
      console.error("[SMS] Scheduler error:", err);
    }
  }, 5 * 60 * 1000);

  setTimeout(() => {
    processReminders().catch(console.error);
    processReviewRequests().catch(console.error);
  }, 10_000);
}

async function processReminders(): Promise<void> {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const upcomingAppointments = await storage.getAppointmentsNeedingReminders(
    in24h,
    in25h
  );

  for (const appt of upcomingAppointments) {
    await sendAppointmentReminder(appt);
  }

  if (upcomingAppointments.length > 0) {
    console.log(
      `[SMS] Processed ${upcomingAppointments.length} reminder(s)`
    );
  }
}

async function processReviewRequests(): Promise<void> {
  const now = new Date();
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const ninetyMinAgo = new Date(now.getTime() - 90 * 60 * 1000);

  const completedAppointments = await storage.getRecentlyCompletedAppointments(
    ninetyMinAgo,
    thirtyMinAgo
  );

  let sent = 0;
  for (const appt of completedAppointments) {
    try {
      await sendReviewRequest(appt);
      sent++;
    } catch (err) {
      console.error(`[SMS] Review request error for appointment ${appt.id}:`, err);
    }
  }

  if (sent > 0) {
    console.log(`[SMS] Sent ${sent} review request(s)`);
  }
}

export function stopReminderScheduler(): void {
  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
    reminderIntervalId = null;
  }
}
