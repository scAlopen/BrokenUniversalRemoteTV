import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/remote/Header';
import { BrandSelector } from '@/components/remote/BrandSelector';
import { TvScanner } from '@/components/remote/TvScanner';
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
import type { UserSettings, TvBrand, DetectedTv } from '@shared/schema';

export default function RemotePage() {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedTv, setSelectedTv] = useState<DetectedTv | null>(null);
  const [activeTab, setActiveTab] = useState<'brands' | 'nearby'>('nearby');
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

  const handleTvSelect = useCallback((tv: DetectedTv) => {
    setSelectedTv(tv);
    if (tv.brand) {
      setSelectedBrand(tv.brand);
      updateSettingsMutation.mutate({ 
        selectedBrand: tv.brand,
        selectedTvId: tv.id 
      });
      
      toast({
        title: `${tv.name} Selected`,
        description: `Connected to ${tv.brand} TV at ${tv.ipAddress || 'unknown location'}`,
      });
    }
  }, [updateSettingsMutation, toast]);

  const handleBrandChange = useCallback((brand: string) => {
    setSelectedBrand(brand);
    updateSettingsMutation.mutate({ selectedBrand: brand });
    
    const brandInfo = brands.find(b => b.name === brand);
    toast({
      title: `${brandInfo?.displayName} Selected`,
      description: `IR codes loaded for ${brandInfo?.displayName} TVs`,
    });
  }, [brands, updateSettingsMutation, toast]);

  const sendIrCommand = useCallback(async (command: string, attempt: number = 0) => {
    if (!selectedBrand) {
      toast({
        title: "No TV Brand Selected",
        description: "Please select your TV brand first",
        variant: "destructive",
      });
      return;
    }

    setIsTransmitting(true);

    try {
      // Send command with enhanced API that supports multiple codes
      const response = await apiRequest('POST', '/api/send-command', {
        command,
        brand: selectedBrand,
        tvId: selectedTv?.id,
        method: isConnected ? 'bluetooth' : 'IR',
        attempt
      });

      const result = await response.json();

      if (result.success) {
        if (isConnected) {
          // Send via Bluetooth with actual IR code
          await sendCommand(result.irCode);
          toast({
            title: "Command Sent",
            description: `${command} sent via Bluetooth${result.totalCodes > 1 ? ` (Code ${result.attempt}/${result.totalCodes})` : ''}`,
          });
        } else {
          // Show IR code for manual use with generation info
          const generationInfo = result.totalCodes > 1 ? ` (Compatible code ${result.attempt}/${result.totalCodes})` : '';
          toast({
            title: "IR Code Ready",
            description: `${command}: ${result.irCode}${generationInfo}`,
            duration: 4000,
          });
        }

        // Show additional help for Samsung first-gen users
        if (selectedBrand === 'samsung' && result.totalCodes > 1 && attempt === 0) {
          setTimeout(() => {
            toast({
              title: "Multiple Codes Available",
              description: "If this doesn't work, press the button again to try alternative codes for older Samsung TVs",
              duration: 6000,
            });
          }, 1000);
        }
      }
    } catch (error) {
      // If first attempt failed and multiple codes are available, try next code
      if (attempt === 0 && selectedBrand === 'samsung') {
        setTimeout(() => {
          toast({
            title: "Trying Alternative Code",
            description: "Using older Samsung TV compatibility code...",
          });
        }, 500);
        return sendIrCommand(command, attempt + 1);
      }

      toast({
        title: "Transmission Failed",
        description: error instanceof Error ? error.message : 'Failed to send command',
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsTransmitting(false), 800);
    }
  }, [selectedBrand, selectedTv, isConnected, sendCommand, toast]);

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
        deviceName={selectedTv?.name || device?.name}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'nearby'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Nearby TVs
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'brands'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Brands
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'nearby' ? (
        <TvScanner
          onTvSelect={handleTvSelect}
          selectedTvId={selectedTv?.id}
        />
      ) : (
        <BrandSelector
          brands={brands}
          selectedBrand={selectedBrand}
          onBrandChange={handleBrandChange}
          isLoading={brandsLoading}
        />
      )}

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
