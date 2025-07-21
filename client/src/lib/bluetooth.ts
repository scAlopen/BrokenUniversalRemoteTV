export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
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
          { services: ['12345678-1234-5678-9abc-123456789abc'] }, // Generic IR blaster service UUID
          { namePrefix: 'IR' },
          { namePrefix: 'Blaster' }
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
      const device = await navigator.bluetooth.getDevices();
      const connectedDevice = device.find(d => d.id === this.device?.id);
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
      // Convert hex IR code to bytes for transmission
      const hexCode = code.replace('0x', '');
      const bytes = new Uint8Array(hexCode.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
      
      await this.characteristic.writeValue(bytes);
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
