import { tvBrands, userSettings, detectedTvs, type TvBrand, type UserSettings, type DetectedTv, type InsertTvBrand, type InsertUserSettings, type InsertDetectedTv } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import irCodesData from "./data/ir-codes.json";

export interface IStorage {
  getTvBrands(): Promise<TvBrand[]>;
  getTvBrandByName(name: string): Promise<TvBrand | undefined>;
  getUserSettings(): Promise<UserSettings | undefined>;
  updateUserSettings(settings: Partial<InsertUserSettings>): Promise<UserSettings>;
  getDetectedTvs(): Promise<DetectedTv[]>;
  addDetectedTv(tv: InsertDetectedTv): Promise<DetectedTv>;
  updateDetectedTv(id: number, tv: Partial<InsertDetectedTv>): Promise<DetectedTv>;
  removeDetectedTv(id: number): Promise<void>;
  scanForTvs(): Promise<DetectedTv[]>;
}

export class MemStorage implements IStorage {
  private tvBrandsData: Map<string, TvBrand>;
  private userSettingsData: UserSettings;
  private detectedTvsData: Map<number, DetectedTv>;
  private currentId: number;
  private tvCurrentId: number;

  constructor() {
    this.tvBrandsData = new Map();
    this.detectedTvsData = new Map();
    this.currentId = 1;
    this.tvCurrentId = 1;
    
    // Initialize with IR codes data
    Object.values(irCodesData).forEach((brand: any) => {
      const tvBrand: TvBrand = {
        id: this.currentId++,
        name: brand.name,
        displayName: brand.displayName,
        irCodes: brand.codes,
      };
      this.tvBrandsData.set(brand.name, tvBrand);
    });

    // Initialize user settings
    this.userSettingsData = {
      id: 1,
      selectedBrand: null,
      bluetoothDeviceId: null,
      selectedTvId: null,
      preferences: {},
    };
  }

  async getTvBrands(): Promise<TvBrand[]> {
    return Array.from(this.tvBrandsData.values());
  }

  async getTvBrandByName(name: string): Promise<TvBrand | undefined> {
    return this.tvBrandsData.get(name);
  }

  async getUserSettings(): Promise<UserSettings | undefined> {
    return this.userSettingsData;
  }

  async updateUserSettings(settings: Partial<InsertUserSettings>): Promise<UserSettings> {
    this.userSettingsData = {
      ...this.userSettingsData,
      ...settings,
    };
    return this.userSettingsData;
  }

  async getDetectedTvs(): Promise<DetectedTv[]> {
    return Array.from(this.detectedTvsData.values());
  }

  async addDetectedTv(tv: InsertDetectedTv): Promise<DetectedTv> {
    const newTv: DetectedTv = {
      id: this.tvCurrentId++,
      name: tv.name,
      brand: tv.brand || null,
      ipAddress: tv.ipAddress || null,
      macAddress: tv.macAddress || null,
      deviceType: tv.deviceType,
      isAvailable: tv.isAvailable || null,
      lastSeen: tv.lastSeen,
    };
    this.detectedTvsData.set(newTv.id, newTv);
    return newTv;
  }

  async updateDetectedTv(id: number, tv: Partial<InsertDetectedTv>): Promise<DetectedTv> {
    const existingTv = this.detectedTvsData.get(id);
    if (!existingTv) {
      throw new Error(`TV with id ${id} not found`);
    }
    const updatedTv = { ...existingTv, ...tv };
    this.detectedTvsData.set(id, updatedTv);
    return updatedTv;
  }

  async removeDetectedTv(id: number): Promise<void> {
    this.detectedTvsData.delete(id);
  }

  async scanForTvs(): Promise<DetectedTv[]> {
    // Simulate network scanning for TVs
    const now = new Date().toISOString();
    const mockTvs: InsertDetectedTv[] = [
      {
        name: "Samsung Smart TV (Living Room)",
        brand: "samsung",
        ipAddress: "192.168.1.101",
        macAddress: "AA:BB:CC:DD:EE:01",
        deviceType: "network",
        isAvailable: true,
        lastSeen: now,
      },
      {
        name: "LG OLED TV (Bedroom)",
        brand: "lg",
        ipAddress: "192.168.1.102",
        macAddress: "AA:BB:CC:DD:EE:02",
        deviceType: "network",
        isAvailable: true,
        lastSeen: now,
      },
      {
        name: "Sony Bravia TV (Kitchen)",
        brand: "sony",
        ipAddress: "192.168.1.103",
        macAddress: "AA:BB:CC:DD:EE:03",
        deviceType: "network",
        isAvailable: true,
        lastSeen: now,
      },
      {
        name: "TCL Roku TV (Guest Room)",
        brand: "tcl",
        ipAddress: "192.168.1.104",
        macAddress: "AA:BB:CC:DD:EE:04",
        deviceType: "network",
        isAvailable: true,
        lastSeen: now,
      }
    ];

    // Clear existing detected TVs and add new ones
    this.detectedTvsData.clear();
    this.tvCurrentId = 1;
    
    const detectedTvs: DetectedTv[] = [];
    for (const tv of mockTvs) {
      const newTv = await this.addDetectedTv(tv);
      detectedTvs.push(newTv);
    }
    
    return detectedTvs;
  }
}

export class DatabaseStorage implements IStorage {
  async getTvBrands(): Promise<TvBrand[]> {
    return await db.select().from(tvBrands);
  }

  async getTvBrandByName(name: string): Promise<TvBrand | undefined> {
    const [brand] = await db.select().from(tvBrands).where(eq(tvBrands.name, name));
    return brand || undefined;
  }

  async getUserSettings(): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).limit(1);
    return settings || undefined;
  }

  async updateUserSettings(settings: Partial<InsertUserSettings>): Promise<UserSettings> {
    // Get existing settings or create new ones
    let existingSettings = await this.getUserSettings();
    
    if (existingSettings) {
      const [updated] = await db
        .update(userSettings)
        .set(settings)
        .where(eq(userSettings.id, existingSettings.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userSettings)
        .values({ ...settings, preferences: settings.preferences || {} })
        .returning();
      return created;
    }
  }

  async getDetectedTvs(): Promise<DetectedTv[]> {
    return await db.select().from(detectedTvs);
  }

  async addDetectedTv(tv: InsertDetectedTv): Promise<DetectedTv> {
    const [newTv] = await db
      .insert(detectedTvs)
      .values(tv)
      .returning();
    return newTv;
  }

  async updateDetectedTv(id: number, tv: Partial<InsertDetectedTv>): Promise<DetectedTv> {
    const [updated] = await db
      .update(detectedTvs)
      .set(tv)
      .where(eq(detectedTvs.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`TV with id ${id} not found`);
    }
    return updated;
  }

  async removeDetectedTv(id: number): Promise<void> {
    await db.delete(detectedTvs).where(eq(detectedTvs.id, id));
  }

  async scanForTvs(): Promise<DetectedTv[]> {
    // Enhanced Bluetooth and network scanning
    const now = new Date().toISOString();
    
    // Clear existing detected TVs for fresh scan
    await db.delete(detectedTvs);
    
    // Simulate network scanning for smart TVs
    const mockNetworkTvs: InsertDetectedTv[] = [
      {
        name: "Samsung 4K Smart TV - First Gen (Living Room)",
        brand: "samsung",
        ipAddress: "192.168.1.101",
        macAddress: "AA:BB:CC:DD:EE:01",
        deviceType: "network",
        isAvailable: true,
        lastSeen: now,
      },
      {
        name: "Samsung QLED 4K TV - 2019 Model (Living Room)",
        brand: "samsung",
        ipAddress: "192.168.1.107",
        macAddress: "AA:BB:CC:DD:EE:07",
        deviceType: "network",
        isAvailable: true,
        lastSeen: now,
      },
      {
        name: "Samsung Crystal UHD 4K - 2016 Model (Bedroom)",
        brand: "samsung",
        ipAddress: "192.168.1.108",
        macAddress: "AA:BB:CC:DD:EE:08",
        deviceType: "network",
        isAvailable: true,
        lastSeen: now,
      },
      {
        name: "LG OLED TV (Bedroom)",
        brand: "lg",
        ipAddress: "192.168.1.102",
        macAddress: "AA:BB:CC:DD:EE:02",
        deviceType: "network",
        isAvailable: true,
        lastSeen: now,
      },
      {
        name: "Sony Bravia TV (Kitchen)",
        brand: "sony",
        ipAddress: "192.168.1.103",
        macAddress: "AA:BB:CC:DD:EE:03",
        deviceType: "network",
        isAvailable: true,
        lastSeen: now,
      },
      {
        name: "TCL Roku TV (Guest Room)",
        brand: "tcl",
        ipAddress: "192.168.1.104",
        macAddress: "AA:BB:CC:DD:EE:04",
        deviceType: "network",
        isAvailable: true,
        lastSeen: now,
      },
      // Bluetooth IR blaster devices
      {
        name: "Broadlink RM4 Pro (Living Room)",
        brand: "universal",
        ipAddress: null,
        macAddress: "12:34:56:78:90:AB",
        deviceType: "bluetooth",
        isAvailable: true,
        lastSeen: now,
      },
      {
        name: "SwitchBot Hub Mini (Bedroom)",
        brand: "universal",
        ipAddress: "192.168.1.105",
        macAddress: "12:34:56:78:90:CD",
        deviceType: "bluetooth",
        isAvailable: true,
        lastSeen: now,
      }
    ];

    const scannedTvs: DetectedTv[] = [];
    for (const tv of mockNetworkTvs) {
      const newTv = await this.addDetectedTv(tv);
      scannedTvs.push(newTv);
    }
    
    return scannedTvs;
  }
}

// Initialize database with TV brands from IR codes
export async function initializeDatabase() {
  try {
    // Check if brands already exist
    const existingBrands = await db.select().from(tvBrands).limit(1);
    if (existingBrands.length === 0) {
      // Initialize with IR codes data
      for (const brand of Object.values(irCodesData)) {
        await db.insert(tvBrands).values({
          name: (brand as any).name,
          displayName: (brand as any).displayName,
          irCodes: (brand as any).codes,
        });
      }
      console.log('Database initialized with TV brands');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export const storage = new DatabaseStorage();
