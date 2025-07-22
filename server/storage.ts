import { tvBrands, userSettings, detectedTvs, type TvBrand, type UserSettings, type DetectedTv, type InsertTvBrand, type InsertUserSettings, type InsertDetectedTv } from "@shared/schema";
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

export const storage = new MemStorage();
