import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Tv, Wifi, Bluetooth, MapPin, Clock } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { DetectedTv } from '@shared/schema';

interface TvScannerProps {
  onTvSelect: (tv: DetectedTv) => void;
  selectedTvId?: number | null;
}

export function TvScanner({ onTvSelect, selectedTvId }: TvScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get detected TVs
  const { data: detectedTvs = [], isLoading } = useQuery<DetectedTv[]>({
    queryKey: ['/api/detected-tvs'],
  });

  // Scan for TVs mutation
  const scanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/scan-tvs', {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/detected-tvs'], data);
      toast({
        title: "Scan Complete",
        description: `Found ${data.length} TV${data.length === 1 ? '' : 's'} in your area`,
      });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : 'Failed to scan for TVs',
        variant: "destructive",
      });
    },
  });

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await scanMutation.mutateAsync();
    } finally {
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'bluetooth': return <Bluetooth className="h-4 w-4" />;
      case 'network': return <Wifi className="h-4 w-4" />;
      default: return <Tv className="h-4 w-4" />;
    }
  };

  const getConnectionBadge = (deviceType: string) => {
    switch (deviceType) {
      case 'bluetooth': return <Badge variant="secondary" className="text-xs">Bluetooth</Badge>;
      case 'network': return <Badge variant="outline" className="text-xs">Network</Badge>;
      default: return <Badge variant="outline" className="text-xs">Manual</Badge>;
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-medium">TVs Around You</h3>
        </div>
        <Button
          onClick={handleScan}
          disabled={isScanning || scanMutation.isPending}
          size="sm"
          variant="outline"
        >
          {isScanning || scanMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Scan
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-gray-600">Loading detected TVs...</p>
        </div>
      ) : detectedTvs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Tv className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h4 className="font-medium mb-2">No TVs Found</h4>
            <p className="text-sm text-gray-600 mb-4">
              Click "Scan" to search for nearby smart TVs and Bluetooth devices.
            </p>
            <Button onClick={handleScan} size="sm">
              <Search className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {detectedTvs.map((tv) => (
            <Card 
              key={tv.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTvId === tv.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onTvSelect(tv)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getDeviceIcon(tv.deviceType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{tv.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {getConnectionBadge(tv.deviceType)}
                        {tv.brand && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {tv.brand}
                          </Badge>
                        )}
                      </div>
                      {tv.ipAddress && (
                        <p className="text-xs text-gray-500 mt-1">
                          IP: {tv.ipAddress}
                        </p>
                      )}
                      <div className="flex items-center space-x-1 mt-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatLastSeen(tv.lastSeen)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {tv.isAvailable && (
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isScanning && (
        <div className="text-center py-4">
          <div className="flex items-center justify-center space-x-2 text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Scanning for devices...</span>
          </div>
        </div>
      )}
    </div>
  );
}