import { VolumeX, Volume2, FileVolume, ChevronUp, ChevronDown } from 'lucide-react';

interface VolumeChannelControlsProps {
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onMute: () => void;
  onChannelUp: () => void;
  onChannelDown: () => void;
  isTransmitting: boolean;
}

export function VolumeChannelControls({
  onVolumeUp,
  onVolumeDown,
  onMute,
  onChannelUp,
  onChannelDown,
  isTransmitting
}: VolumeChannelControlsProps) {
  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Volume Controls */}
        <div className="text-center">
          <button
            onClick={onVolumeUp}
            disabled={isTransmitting}
            className="w-14 h-14 bg-secondary text-white rounded-full shadow-md hover:shadow-lg remote-button font-bold mb-2 disabled:opacity-50"
          >
            <Volume2 className="h-5 w-5 mx-auto" />
          </button>
          <button
            onClick={onVolumeDown}
            disabled={isTransmitting}
            className="w-14 h-14 bg-secondary text-white rounded-full shadow-md hover:shadow-lg remote-button font-bold disabled:opacity-50"
          >
            <FileVolume className="h-5 w-5 mx-auto" />
          </button>
          <p className="text-xs text-gray-500 mt-2">Volume</p>
        </div>

        {/* Mute Button */}
        <div className="text-center">
          <button
            onClick={onMute}
            disabled={isTransmitting}
            className="w-16 h-16 bg-accent text-white rounded-full shadow-md hover:shadow-lg remote-button font-bold disabled:opacity-50"
          >
            <VolumeX className="h-6 w-6 mx-auto" />
          </button>
          <p className="text-xs text-gray-500 mt-2">Mute</p>
        </div>

        {/* Channel Controls */}
        <div className="text-center">
          <button
            onClick={onChannelUp}
            disabled={isTransmitting}
            className="w-14 h-14 bg-secondary text-white rounded-full shadow-md hover:shadow-lg remote-button font-bold mb-2 disabled:opacity-50"
          >
            <ChevronUp className="h-5 w-5 mx-auto" />
          </button>
          <button
            onClick={onChannelDown}
            disabled={isTransmitting}
            className="w-14 h-14 bg-secondary text-white rounded-full shadow-md hover:shadow-lg remote-button font-bold disabled:opacity-50"
          >
            <ChevronDown className="h-5 w-5 mx-auto" />
          </button>
          <p className="text-xs text-gray-500 mt-2">Channel</p>
        </div>
      </div>
    </div>
  );
}
