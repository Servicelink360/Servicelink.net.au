import { z } from "zod";

const email = z.string().trim().email("Please provide a valid email address.");
const name = z.string().trim().min(1, "Name is required.").max(255);

export const contactSchema = z.object({
  name,
  email,
  phone: z.string().trim().max(64).optional(),
  company: z.string().trim().max(255).optional(),
  subject: z.string().trim().min(1, "Please select a subject.").max(64),
  message: z.string().trim().min(1, "Message is required.").max(5000),
  source: z.string().trim().max(64).optional(),
  referrer: z.string().trim().max(255).optional(),
});

export const quoteSchema = z.object({
  name,
  email,
  phone: z.string().trim().min(1, "Phone is required.").max(64),
  company: z.string().trim().max(255).optional(),
  service: z.string().trim().min(1, "Please select a service.").max(255),
  location: z.string().trim().min(1, "Site location is required.").max(255),
  portfolioSize: z.string().trim().max(32).optional(),
  timeframe: z.string().trim().max(64).optional(),
  locationPage: z.string().trim().max(255).optional(),
  message: z.string().trim().min(1, "Please describe your requirements.").max(5000),
  source: z.string().trim().max(64).optional(),
});

export const subscribeSchema = z.object({
  email,
  name: z.string().trim().max(255).optional(),
  source: z.string().trim().max(64).optional(),
});

export const registerSchema = z.object({
  name,
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128),
  subscribeToUpdates: z.boolean().optional().default(true),
  source: z.string().trim().max(64).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
