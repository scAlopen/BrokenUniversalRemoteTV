import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/remote/Header';
import { BrandSelector } from '@/components/remote/BrandSelector';
import { PowerControls } from '@/components/remote/PowerControls';
import { VolumeChannelControls } from '@/components/remote/VolumeChannelControls';
import { NavigationControls } from '@/components/remote/NavigationControls';
import { MenuControls } from '@/components/remote/MenuControls';
import { NumberPad } from '@/components/remote/NumberPad';
import { BottomActions } from '@/components/remote/BottomActions';
import { ChannelDisplay } from '@/components/remote/ChannelDisplay';
import { LoadingOverlay } from '@/components/remote/LoadingOverlay';
import { SettingsModal } from '@/components/remote/SettingsModal';
import { HelpModal } from '@/components/remote/HelpModal';
import { useBluetooth } from '@/hooks/use-bluetooth';
import { useIrCodes } from '@/hooks/use-ir-codes';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { UserSettings, TvBrand } from '@shared/schema';

export default function RemotePage() {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [channelBuffer, setChannelBuffer] = useState('');
  const [showChannelDisplay, setShowChannelDisplay] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [channelTimeout, setChannelTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const { device, isConnected, sendCommand } = useBluetooth();
  const { brands, isLoading: brandsLoading, getIrCode } = useIrCodes();
  const queryClient = useQueryClient();

  // Load user settings
  const { data: settings } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
  });

  // Update user settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      const response = await apiRequest('POST', '/api/settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
  });

  // Set selected brand from settings
  useEffect(() => {
    if (settings?.selectedBrand && !selectedBrand) {
      setSelectedBrand(settings.selectedBrand);
    }
  }, [settings, selectedBrand]);

  const handleBrandChange = useCallback((brand: string) => {
    setSelectedBrand(brand);
    updateSettingsMutation.mutate({ selectedBrand: brand });
    
    const brandInfo = brands.find(b => b.name === brand);
    toast({
      title: `${brandInfo?.displayName} Selected`,
      description: `IR codes loaded for ${brandInfo?.displayName} TVs`,
    });
  }, [brands, updateSettingsMutation, toast]);

  const sendIrCommand = useCallback(async (command: string) => {
    if (!selectedBrand) {
      toast({
        title: "No TV Brand Selected",
        description: "Please select your TV brand first",
        variant: "destructive",
      });
      return;
    }

    const irCode = getIrCode(selectedBrand, command);
    if (!irCode) {
      toast({
        title: "Command Not Available",
        description: `${command} command not found for ${selectedBrand}`,
        variant: "destructive",
      });
      return;
    }

    setIsTransmitting(true);

    try {
      if (isConnected) {
        // Send via Bluetooth
        await sendCommand(irCode);
        toast({
          title: "Command Sent",
          description: `${command} sent via Bluetooth`,
        });
      } else {
        // Show IR code for manual use
        toast({
          title: "IR Code",
          description: `${command}: ${irCode}`,
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Transmission Failed",
        description: error instanceof Error ? error.message : 'Failed to send command',
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsTransmitting(false), 800);
    }
  }, [selectedBrand, getIrCode, isConnected, sendCommand, toast]);

  const handleNumberPress = useCallback((number: string) => {
    const newBuffer = channelBuffer + number;
    setChannelBuffer(newBuffer);
    setShowChannelDisplay(true);

    // Clear previous timeout
    if (channelTimeout) {
      clearTimeout(channelTimeout);
    }

    // Set new timeout to send channel change
    const timeout = setTimeout(() => {
      sendIrCommand(`${number}`);
      setShowChannelDisplay(false);
      setChannelBuffer('');
    }, 1500);

    setChannelTimeout(timeout);
  }, [channelBuffer, channelTimeout, sendIrCommand]);

  const handleEnter = useCallback(() => {
    if (channelBuffer) {
      // Send each digit of the channel
      for (const digit of channelBuffer) {
        sendIrCommand(digit);
      }
      sendIrCommand('enter');
      setShowChannelDisplay(false);
      setChannelBuffer('');
      if (channelTimeout) {
        clearTimeout(channelTimeout);
      }
    } else {
      sendIrCommand('ok');
    }
  }, [channelBuffer, channelTimeout, sendIrCommand]);

  const getConnectionStatus = (): 'connected' | 'connecting' | 'disconnected' => {
    if (isConnected) return 'connected';
    if (isTransmitting) return 'connecting';
    return 'disconnected';
  };

  const showConnectionAlert = !isConnected && selectedBrand;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
      <Header 
        connectionStatus={getConnectionStatus()}
        deviceName={device?.name}
      />

      <BrandSelector
        brands={brands}
        selectedBrand={selectedBrand}
        onBrandChange={handleBrandChange}
        isLoading={brandsLoading}
      />

      {/* Connection Status Alert */}
      {showConnectionAlert && (
        <div className={`mx-4 mt-4 p-3 rounded border-l-4 ${
          isConnected 
            ? 'bg-green-50 border-green-500' 
            : 'bg-orange-50 border-orange-500'
        }`}>
          <div className="flex items-start">
            {isConnected ? (
              <>
                <CheckCircle className="text-green-500 mt-0.5 mr-2 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium text-green-800">Connected</p>
                  <p className="text-xs text-green-700 mt-1">
                    Commands will be sent via Bluetooth
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="text-orange-500 mt-0.5 mr-2 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Setup Required</p>
                  <p className="text-xs text-orange-700 mt-1">
                    IR codes will be displayed. Connect a Bluetooth IR blaster in Settings for direct control.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <PowerControls
        onPowerToggle={() => sendIrCommand('power')}
        isTransmitting={isTransmitting}
      />

      <VolumeChannelControls
        onVolumeUp={() => sendIrCommand('volumeUp')}
        onVolumeDown={() => sendIrCommand('volumeDown')}
        onMute={() => sendIrCommand('mute')}
        onChannelUp={() => sendIrCommand('channelUp')}
        onChannelDown={() => sendIrCommand('channelDown')}
        isTransmitting={isTransmitting}
      />

      <NavigationControls
        onNavUp={() => sendIrCommand('navUp')}
        onNavDown={() => sendIrCommand('navDown')}
        onNavLeft={() => sendIrCommand('navLeft')}
        onNavRight={() => sendIrCommand('navRight')}
        onOK={() => sendIrCommand('ok')}
        isTransmitting={isTransmitting}
      />

      <MenuControls
        onMenu={() => sendIrCommand('menu')}
        onBack={() => sendIrCommand('back')}
        onHome={() => sendIrCommand('home')}
        isTransmitting={isTransmitting}
      />

      <NumberPad
        onNumberPress={handleNumberPress}
        onPrevChannel={() => sendIrCommand('prevChannel')}
        onEnter={handleEnter}
        isTransmitting={isTransmitting}
      />

      <BottomActions
        onSettingsClick={() => setShowSettings(true)}
        onHelpClick={() => setShowHelp(true)}
      />

      <ChannelDisplay
        channel={channelBuffer}
        visible={showChannelDisplay}
      />

      <LoadingOverlay
        visible={isTransmitting}
        message="Sending command..."
      />

      <SettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      <HelpModal
        open={showHelp}
        onOpenChange={setShowHelp}
      />
    </div>
  );
}
