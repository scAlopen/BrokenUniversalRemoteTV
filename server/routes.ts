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

  // Send IR command to TV with fallback codes
  app.post("/api/send-command", async (req, res) => {
    try {
      const { command, brand, tvId, method, attempt = 0 } = req.body;
      
      // Get TV brand info for IR codes
      let irCodes: string | string[] = "";
      let selectedCode = "";
      
      if (brand) {
        const brandInfo = await storage.getTvBrandByName(brand);
        if (brandInfo && brandInfo.irCodes && (brandInfo.irCodes as any)[command]) {
          irCodes = (brandInfo.irCodes as any)[command];
          
          // Handle multiple IR codes for compatibility
          if (Array.isArray(irCodes)) {
            // Use different codes based on attempt (for retry logic)
            const codeIndex = Math.min(attempt, irCodes.length - 1);
            selectedCode = irCodes[codeIndex];
          } else {
            selectedCode = irCodes;
          }
        }
      }
      
      // Enhanced logging for different TV generations
      console.log(`Sending ${command} command to ${brand || 'unknown'} TV via ${method || 'IR'} method`);
      console.log(`Attempt ${attempt + 1}: Using IR Code: ${selectedCode}`);
      if (Array.isArray(irCodes) && irCodes.length > 1) {
        console.log(`Available fallback codes: ${irCodes.length} total`);
      }
      
      // Simulate command success with higher success rate for newer attempts
      const success = Math.random() > (attempt * 0.1); // Higher chance on first attempts
      
      res.json({ 
        success: true, 
        command, 
        brand: brand || 'unknown',
        method: method || 'IR',
        irCode: selectedCode || 'N/A',
        attempt: attempt + 1,
        totalCodes: Array.isArray(irCodes) ? irCodes.length : 1,
        timestamp: new Date().toISOString(),
        note: Array.isArray(irCodes) ? `Multiple IR codes available for ${brand} TV compatibility` : 'Single IR code'
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send command" });
    }
  });

  // Connect to Bluetooth device
  app.post("/api/bluetooth/connect", async (req, res) => {
    try {
      const { deviceId, deviceName } = req.body;
      
      // Update user settings with Bluetooth device info
      await storage.updateUserSettings({ 
        bluetoothDeviceId: deviceId,
        preferences: { bluetoothDeviceName: deviceName }
      });
      
      console.log(`Connected to Bluetooth device: ${deviceName} (${deviceId})`);
      
      res.json({ 
        success: true, 
        deviceId, 
        deviceName,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to connect to Bluetooth device" });
    }
  });

  // Disconnect Bluetooth device
  app.post("/api/bluetooth/disconnect", async (req, res) => {
    try {
      await storage.updateUserSettings({ 
        bluetoothDeviceId: null,
        preferences: {}
      });
      
      console.log("Disconnected from Bluetooth device");
      
      res.json({ 
        success: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to disconnect Bluetooth device" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
