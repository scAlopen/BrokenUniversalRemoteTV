import { tvBrands, userSettings, type TvBrand, type UserSettings, type InsertTvBrand, type InsertUserSettings } from "@shared/schema";
import irCodesData from "./data/ir-codes.json";

export interface IStorage {
  getTvBrands(): Promise<TvBrand[]>;
  getTvBrandByName(name: string): Promise<TvBrand | undefined>;
  getUserSettings(): Promise<UserSettings | undefined>;
  updateUserSettings(settings: Partial<InsertUserSettings>): Promise<UserSettings>;
}

export class MemStorage implements IStorage {
  private tvBrandsData: Map<string, TvBrand>;
  private userSettingsData: UserSettings;
  private currentId: number;

  constructor() {
    this.tvBrandsData = new Map();
    this.currentId = 1;
    
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
}

export const storage = new MemStorage();
