import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSettingsSchema, insertDetectedTvSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all TV brands
  app.get("/api/tv-brands", async (req, res) => {
    try {
      const brands = await storage.getTvBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch TV brands" });
    }
  });

  // Get specific TV brand by name
  app.get("/api/tv-brands/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const brand = await storage.getTvBrandByName(name);
      if (!brand) {
        return res.status(404).json({ error: "TV brand not found" });
      }
      res.json(brand);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch TV brand" });
    }
  });

  // Get user settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getUserSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user settings" });
    }
  });

  // Update user settings
  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertUserSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateUserSettings(validatedData);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user settings" });
    }
  });

  // Get detected TVs
  app.get("/api/detected-tvs", async (req, res) => {
    try {
      const detectedTvs = await storage.getDetectedTvs();
      res.json(detectedTvs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch detected TVs" });
    }
  });

  // Scan for TVs in the area
  app.post("/api/scan-tvs", async (req, res) => {
    try {
      const detectedTvs = await storage.scanForTvs();
      res.json(detectedTvs);
    } catch (error) {
      res.status(500).json({ error: "Failed to scan for TVs" });
    }
  });

  // Add a detected TV manually
  app.post("/api/detected-tvs", async (req, res) => {
    try {
      const validatedData = insertDetectedTvSchema.parse(req.body);
      const newTv = await storage.addDetectedTv(validatedData);
      res.json(newTv);
    } catch (error) {
      res.status(500).json({ error: "Failed to add detected TV" });
    }
  });

  // Remove a detected TV
  app.delete("/api/detected-tvs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeDetectedTv(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove detected TV" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
