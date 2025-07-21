import { Power } from 'lucide-react';

interface PowerControlsProps {
  onPowerToggle: () => void;
  isTransmitting: boolean;
}

export function PowerControls({ onPowerToggle, isTransmitting }: PowerControlsProps) {
  return (
    <div className="p-4">
      <div className="text-center">
        <button
          onClick={onPowerToggle}
          disabled={isTransmitting}
          className="w-20 h-20 bg-destructive text-white rounded-full shadow-lg hover:shadow-xl remote-button font-bold text-lg disabled:opacity-50"
        >
          <Power className="h-8 w-8 mx-auto" />
        </button>
        <p className="text-xs text-gray-500 mt-2">Power</p>
      </div>
    </div>
  );
}
