import { useState, useCallback } from 'react';
import { bluetoothService, type BluetoothDevice } from '@/lib/bluetooth';
import { useToast } from '@/hooks/use-toast';

export function useBluetooth() {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const { toast } = useToast();

  const checkSupport = useCallback(async () => {
    const supported = await bluetoothService.isSupported();
    setIsSupported(supported);
    return supported;
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const connectedDevice = await bluetoothService.connect();
      setDevice(connectedDevice);
      toast({
        title: "Connected",
        description: `Connected to ${connectedDevice.name}`,
      });
      return connectedDevice;
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect to Bluetooth device',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const disconnect = useCallback(async () => {
    try {
      await bluetoothService.disconnect();
      setDevice(null);
      toast({
        title: "Disconnected",
        description: "Bluetooth device disconnected",
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : 'Failed to disconnect',
        variant: "destructive",
      });
    }
  }, [toast]);

  const sendCommand = useCallback(async (irCode: string) => {
    try {
      await bluetoothService.sendIRCode(irCode);
      return true;
    } catch (error) {
      toast({
        title: "Command Failed",
        description: error instanceof Error ? error.message : 'Failed to send IR command',
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    device,
    isConnecting,
    isSupported,
    isConnected: device?.connected ?? false,
    checkSupport,
    connect,
    disconnect,
    sendCommand,
  };
}
