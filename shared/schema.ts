import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tvBrands = pgTable("tv_brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  irCodes: jsonb("ir_codes").notNull(),
});

export const detectedTvs = pgTable("detected_tvs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  ipAddress: text("ip_address"),
  macAddress: text("mac_address"),
  deviceType: text("device_type").notNull(), // 'network', 'bluetooth', 'manual'
  isAvailable: boolean("is_available").default(true),
  lastSeen: text("last_seen").notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  selectedBrand: text("selected_brand"),
  bluetoothDeviceId: text("bluetooth_device_id"),
  selectedTvId: integer("selected_tv_id").references(() => detectedTvs.id),
  preferences: jsonb("preferences").default({}),
});

export const insertTvBrandSchema = createInsertSchema(tvBrands).pick({
  name: true,
  displayName: true,
  irCodes: true,
});

export const insertDetectedTvSchema = createInsertSchema(detectedTvs).pick({
  name: true,
  brand: true,
  ipAddress: true,
  macAddress: true,
  deviceType: true,
  isAvailable: true,
  lastSeen: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  selectedBrand: true,
  bluetoothDeviceId: true,
  selectedTvId: true,
  preferences: true,
});

export type InsertTvBrand = z.infer<typeof insertTvBrandSchema>;
export type TvBrand = typeof tvBrands.$inferSelect;
export type InsertDetectedTv = z.infer<typeof insertDetectedTvSchema>;
export type DetectedTv = typeof detectedTvs.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
