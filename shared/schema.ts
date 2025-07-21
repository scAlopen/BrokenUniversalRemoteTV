import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tvBrands = pgTable("tv_brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  irCodes: jsonb("ir_codes").notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  selectedBrand: text("selected_brand"),
  bluetoothDeviceId: text("bluetooth_device_id"),
  preferences: jsonb("preferences").default({}),
});

export const insertTvBrandSchema = createInsertSchema(tvBrands).pick({
  name: true,
  displayName: true,
  irCodes: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  selectedBrand: true,
  bluetoothDeviceId: true,
  preferences: true,
});

export type InsertTvBrand = z.infer<typeof insertTvBrandSchema>;
export type TvBrand = typeof tvBrands.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
