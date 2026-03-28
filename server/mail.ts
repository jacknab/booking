import FormData from "form-data";
import Mailgun from "mailgun.js";
import { storage } from "./storage";
import type { AppointmentWithDetails } from "@shared/schema";
import { formatInTimeZone } from "date-fns-tz";

const mailgun = new Mailgun(FormData);

function getMailgunClient(apiKey: string, domain: string) {
  if (!apiKey || !domain) {
    return null;
  }
  return mailgun.client({ key: apiKey, username: "api" });
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

export async function sendEmail(
  storeId: number,
  to: string,
  subject: string,
  html: string,
  text?: string,
  from?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  // Always use platform-level .env credentials — never per-store keys
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    console.warn(`Email skipped for store ${storeId}: MAILGUN_API_KEY or MAILGUN_DOMAIN not set in .env`);
    return { success: false, error: "Mailgun not configured (check MAILGUN_API_KEY and MAILGUN_DOMAIN in .env)" };
  }

  const client = getMailgunClient(apiKey, domain);
  if (!client) {
    return { success: false, error: "Mailgun credentials invalid" };
  }

  const senderEmail = from || process.env.MAILGUN_FROM_EMAIL || `noreply@${domain}`;

  try {
    const response = await client.messages.create(domain, {
      from: senderEmail,
      to: to,
      subject: subject,
      html: html,
      ...(text && { text: text }),
    });

    return { success: true, id: response.id };
  } catch (err: any) {
    const errorMessage = err.message || "Unknown error";
    console.error(`Email send failed for store ${storeId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendBookingConfirmationEmail(
  appointment: AppointmentWithDetails
): Promise<void> {
  if (!appointment.customer?.email || !appointment.storeId) return;

  const settings = await storage.getMailSettings(appointment.storeId);
  if (!settings?.bookingConfirmationEnabled) return;

  const timezone = appointment.store?.timezone || "UTC";
  const template =
    settings.confirmationTemplate ||
    `<p>Hi {customerName},</p>
<p>Your appointment at {storeName} is confirmed for {appointmentDate} at {appointmentTime}.</p>
<p>See you then!</p>`;

  const html = interpolateTemplate(template, {
    customerName: appointment.customer?.name || "there",
    storeName: appointment.store?.name || "our salon",
    appointmentDate: formatInTimeZone(
      appointment.date,
      timezone,
      "MMMM dd, yyyy"
    ),
    appointmentTime: formatInTimeZone(appointment.date, timezone, "HH:mm a"),
    serviceName: appointment.service?.name || "your service",
  });

  const plainText = interpolateTemplate(
    settings.confirmationTemplate
      ? settings.confirmationTemplate.replace(/<[^>]*>/g, "")
      : `Hi {customerName}, your appointment at {storeName} is confirmed for {appointmentDate} at {appointmentTime}. See you then!`,
    {
      customerName: appointment.customer?.name || "there",
      storeName: appointment.store?.name || "our salon",
      appointmentDate: formatInTimeZone(
        appointment.date,
        timezone,
        "MMMM dd, yyyy"
      ),
      appointmentTime: formatInTimeZone(appointment.date, timezone, "HH:mm a"),
      serviceName: appointment.service?.name || "your service",
    }
  );

  await sendEmail(
    appointment.storeId,
    appointment.customer.email,
    `Appointment Confirmation - ${appointment.store?.name || "Your Appointment"}`,
    html,
    plainText
  );
}

export async function sendReminderEmail(
  appointment: AppointmentWithDetails
): Promise<void> {
  if (!appointment.customer?.email || !appointment.storeId) return;

  const settings = await storage.getMailSettings(appointment.storeId);
  if (!settings?.reminderEnabled) return;

  const timezone = appointment.store?.timezone || "UTC";
  const template =
    settings.reminderTemplate ||
    `<p>Hi {customerName},</p>
<p>This is a reminder of your appointment at {storeName} on {appointmentDate} at {appointmentTime}.</p>
<p>Reply to this email to confirm or cancel.</p>`;

  const html = interpolateTemplate(template, {
    customerName: appointment.customer?.name || "there",
    storeName: appointment.store?.name || "our salon",
    appointmentDate: formatInTimeZone(
      appointment.date,
      timezone,
      "MMMM dd, yyyy"
    ),
    appointmentTime: formatInTimeZone(appointment.date, timezone, "HH:mm a"),
    serviceName: appointment.service?.name || "your service",
  });

  const plainText = interpolateTemplate(
    settings.reminderTemplate
      ? settings.reminderTemplate.replace(/<[^>]*>/g, "")
      : `Hi {customerName}, this is a reminder of your appointment at {storeName} on {appointmentDate} at {appointmentTime}.`,
    {
      customerName: appointment.customer?.name || "there",
      storeName: appointment.store?.name || "our salon",
      appointmentDate: formatInTimeZone(
        appointment.date,
        timezone,
        "MMMM dd, yyyy"
      ),
      appointmentTime: formatInTimeZone(appointment.date, timezone, "HH:mm a"),
      serviceName: appointment.service?.name || "your service",
    }
  );

  await sendEmail(
    appointment.storeId,
    appointment.customer.email,
    `Appointment Reminder - ${appointment.store?.name || "Your Appointment"}`,
    html,
    plainText
  );
}

export async function sendReviewRequestEmail(
  appointment: AppointmentWithDetails
): Promise<void> {
  if (!appointment.customer?.email || !appointment.storeId) return;

  const settings = await storage.getMailSettings(appointment.storeId);
  if (!settings?.reviewRequestEnabled) return;

  const template =
    settings.reviewTemplate ||
    `<p>Hi {customerName},</p>
<p>Thank you for visiting {storeName}! We'd love your feedback.</p>
<p><a href="{reviewUrl}">Leave us a review</a></p>`;

  const html = interpolateTemplate(template, {
    customerName: appointment.customer?.name || "there",
    storeName: appointment.store?.name || "our salon",
    reviewUrl: settings.googleReviewUrl || "#",
  });

  const plainText = interpolateTemplate(
    settings.reviewTemplate
      ? settings.reviewTemplate.replace(/<[^>]*>/g, "")
      : `Hi {customerName}, thank you for visiting {storeName}! We'd love your feedback. {reviewUrl}`,
    {
      customerName: appointment.customer?.name || "there",
      storeName: appointment.store?.name || "our salon",
      reviewUrl: settings.googleReviewUrl || "",
    }
  );

  await sendEmail(
    appointment.storeId,
    appointment.customer.email,
    `We'd love your feedback - ${appointment.store?.name || "Your Salon"}`,
    html,
    plainText
  );
}

export function startEmailReminderScheduler() {
  // Scheduler implementation would go here
  // This would send reminders X hours before appointments
  console.log("Email reminder scheduler started");
}
