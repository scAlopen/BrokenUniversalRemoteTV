export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
}

// Type declarations for Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }
  interface Bluetooth {
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
    getDevices(): Promise<BluetoothDevice[]>;
  }
  interface BluetoothDevice {
    id: string;
    name: string | undefined;
    gatt?: BluetoothRemoteGATTServer;
    addEventListener(type: string, listener: EventListener): void;
  }
  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
  }
  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
  }
  interface BluetoothRemoteGATTCharacteristic {
    writeValue(value: ArrayBuffer): Promise<void>;
  }
  interface RequestDeviceOptions {
    filters?: BluetoothLEScanFilter[];
    optionalServices?: string[];
  }
  interface BluetoothLEScanFilter {
    services?: string[];
    name?: string;
    namePrefix?: string;
  }
}

export class BluetoothService {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  async isSupported(): Promise<boolean> {
    return 'bluetooth' in navigator && 'requestDevice' in navigator.bluetooth;
  }

  async connect(): Promise<BluetoothDevice> {
    if (!await this.isSupported()) {
      throw new Error('Web Bluetooth API is not supported on this device');
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Broadlink' }, // Broadlink IR blasters
          { namePrefix: 'SwitchBot' }, // SwitchBot Hub
          { namePrefix: 'IR' }, // Generic IR devices
          { namePrefix: 'Blaster' }, // IR blasters
          { namePrefix: 'Remote' }, // Universal remotes
          { services: ['12345678-1234-5678-9abc-123456789abc'] } // Generic IR blaster service UUID
        ],
        optionalServices: ['12345678-1234-5678-9abc-123456789abc']
      });

      if (!device.gatt) {
        throw new Error('GATT not supported on this device');
      }

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('12345678-1234-5678-9abc-123456789abc');
      this.characteristic = await service.getCharacteristic('87654321-4321-8765-cba9-876543210abc');

      this.device = {
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: true
      };

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        if (this.device) {
          this.device.connected = false;
        }
        this.characteristic = null;
      });

      return this.device;
    } catch (error) {
      throw new Error(`Failed to connect to Bluetooth device: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.device && this.characteristic) {
      const devices = await navigator.bluetooth.getDevices();
      const connectedDevice = devices.find((d: any) => d.id === this.device?.id);
      if (connectedDevice && connectedDevice.gatt?.connected) {
        connectedDevice.gatt.disconnect();
      }
    }
    this.device = null;
    this.characteristic = null;
  }

  async sendIRCode(code: string): Promise<void> {
    if (!this.characteristic) {
      throw new Error('No Bluetooth device connected');
    }

    try {
      // Enhanced IR code handling for different TV brands and protocols
      let irData: Uint8Array;
      
      if (code.startsWith('0x') || code.match(/^[0-9A-Fa-f]+$/)) {
        // Hex format - convert to bytes
        const hexCode = code.replace('0x', '');
        irData = new Uint8Array(hexCode.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
      } else if (code.includes(',')) {
        // Comma-separated format (e.g., "38000,1,1,1,1,1,3,3,3...")
        const values = code.split(',').map(v => parseInt(v.trim()));
        irData = new Uint8Array(values);
      } else {
        // Raw string format - encode as UTF-8
        const encoder = new TextEncoder();
        irData = encoder.encode(code);
      }
      
      // Send the IR command via Bluetooth
      await this.characteristic.writeValue(irData.buffer);
      
      // Add small delay for device processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      throw new Error(`Failed to send IR code: ${error}`);
    }
  }

  getDevice(): BluetoothDevice | null {
    return this.device;
  }

  isConnected(): boolean {
    return this.device?.connected ?? false;
  }
}

export const bluetoothService = new BluetoothService();
