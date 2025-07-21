import { CircleDot } from 'lucide-react';

interface HeaderProps {
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  deviceName?: string;
}

export function Header({ connectionStatus, deviceName }: HeaderProps) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return deviceName ? `Connected to ${deviceName}` : 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="bg-primary text-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">TV Remote</h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 ${getStatusColor()} rounded-full`} />
            <span className="text-sm">{getStatusText()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
