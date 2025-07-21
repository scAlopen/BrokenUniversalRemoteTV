import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBluetooth } from '@/hooks/use-bluetooth';
import { Bluetooth, BluetoothConnected, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { 
    device, 
    isConnecting, 
    isSupported, 
    isConnected, 
    checkSupport, 
    connect, 
    disconnect 
  } = useBluetooth();
  const [hasCheckedSupport, setHasCheckedSupport] = useState(false);

  const handleCheckBluetooth = async () => {
    await checkSupport();
    setHasCheckedSupport(true);
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Remote Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Connection Method</h3>
            
            {/* Bluetooth Section */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Bluetooth className="h-5 w-5 text-primary" />
                <span className="font-medium">Bluetooth IR Blaster</span>
              </div>
              
              {!hasCheckedSupport ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Connect to an external IR blaster device for reliable transmission.
                  </p>
                  <Button 
                    onClick={handleCheckBluetooth} 
                    variant="outline" 
                    size="sm"
                  >
                    Check Bluetooth Support
                  </Button>
                </div>
              ) : isSupported === false ? (
                <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  Bluetooth is not supported on this device or browser.
                </div>
              ) : isConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-green-600">
                    <BluetoothConnected className="h-4 w-4" />
                    <span className="text-sm">Connected to {device?.name}</span>
                  </div>
                  <Button 
                    onClick={handleDisconnect} 
                    variant="outline" 
                    size="sm"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    No IR blaster connected. Click to search for nearby devices.
                  </p>
                  <Button 
                    onClick={handleConnect} 
                    disabled={isConnecting}
                    variant="outline" 
                    size="sm"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Bluetooth Device'}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Manual IR Codes Section */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <span className="font-medium">Manual IR Codes</span>
              </div>
              <p className="text-sm text-gray-600">
                Without a Bluetooth IR blaster, IR codes will be displayed for manual programming.
              </p>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500">
              For best results, use an external IR blaster device that supports Web Bluetooth API.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
