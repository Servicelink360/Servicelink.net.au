import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("super_admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  pagePath: varchar("page_path", { length: 512 }),
  landingPath: varchar("landing_path", { length: 512 }),
  trafficReferrer: varchar("traffic_referrer", { length: 512 }),
  searchEngine: varchar("search_engine", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  source: varchar("source", { length: 64 }).notNull().default("website"),
  pagePath: varchar("page_path", { length: 512 }),
  landingPath: varchar("landing_path", { length: 512 }),
  trafficReferrer: varchar("traffic_referrer", { length: 512 }),
  searchEngine: varchar("search_engine", { length: 64 }),
  active: boolean("active").notNull().default(true),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 64 }),
  company: varchar("company", { length: 255 }),
  portfolioSize: varchar("portfolio_size", { length: 32 }),
  message: text("message").notNull(),
  source: varchar("source", { length: 64 }).notNull().default("website"),
  pagePath: varchar("page_path", { length: 512 }),
  landingPath: varchar("landing_path", { length: 512 }),
  trafficReferrer: varchar("traffic_referrer", { length: 512 }),
  searchEngine: varchar("search_engine", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const newsPosts = pgTable("news_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  featuredImage: varchar("featured_image", { length: 512 }),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sitePages = pgTable("site_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  pageType: varchar("page_type", { length: 32 }).notNull().default("standard"),
  content: text("content").notNull().default(""),
  settings: text("settings"),
  published: boolean("published").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 128 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 16 }).notNull(),
    state: varchar("state", { length: 8 }).notNull(),
    parentId: uuid("parent_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    published: boolean("published").notNull().default(true),
    heroImage: varchar("hero_image", { length: 512 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("locations_parent_slug_idx").on(table.parentId, table.slug),
  ],
);

export const seoServices = pgTable("seo_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  linkedServiceSlug: varchar("linked_service_slug", { length: 128 }),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  heroImage: varchar("hero_image", { length: 512 }),
  cardImages: text("card_images"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const seoPages = pgTable("seo_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  path: varchar("path", { length: 512 }).notNull().unique(),
  pageType: varchar("page_type", { length: 32 }).notNull(),
  cityId: uuid("city_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  metroId: uuid("metro_id").references(() => locations.id, { onDelete: "cascade" }),
  seoServiceId: uuid("seo_service_id").references(() => seoServices.id, {
    onDelete: "cascade",
  }),
  metaTitle: varchar("meta_title", { length: 255 }).notNull(),
  metaDescription: text("meta_description").notNull(),
  h1: varchar("h1", { length: 255 }).notNull(),
  intro: text("intro").notNull(),
  body: text("body").notNull(),
  heroImage: varchar("hero_image", { length: 512 }),
  cardImages: text("card_images"),
  published: boolean("published").notNull().default(false),
  noIndex: boolean("no_index").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const locationServiceImages = pgTable("location_service_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  cityId: uuid("city_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  metroId: uuid("metro_id").references(() => locations.id, { onDelete: "cascade" }),
  seoServiceId: uuid("seo_service_id")
    .notNull()
    .references(() => seoServices.id, { onDelete: "cascade" }),
  heroImage: varchar("hero_image", { length: 512 }),
  cardImages: text("card_images"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteVisits = pgTable("site_visits", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  path: varchar("path", { length: 512 }).notNull(),
  landingPath: varchar("landing_path", { length: 512 }),
  searchEngine: varchar("search_engine", { length: 64 }),
  trafficReferrer: varchar("traffic_referrer", { length: 512 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type User = typeof users.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewsPost = typeof newsPosts.$inferSelect;
export type SitePage = typeof sitePages.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type SeoService = typeof seoServices.$inferSelect;
export type SeoPage = typeof seoPages.$inferSelect;
export type LocationServiceImage = typeof locationServiceImages.$inferSelect;
