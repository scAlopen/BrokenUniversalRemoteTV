import { Menu, ArrowLeft, Home } from 'lucide-react';

interface MenuControlsProps {
  onMenu: () => void;
  onBack: () => void;
  onHome: () => void;
  isTransmitting: boolean;
}

export function MenuControls({ onMenu, onBack, onHome, isTransmitting }: MenuControlsProps) {
  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onMenu}
          disabled={isTransmitting}
          className="p-3 bg-gray-200 text-secondary rounded-lg shadow-sm hover:shadow-md remote-button font-medium text-sm disabled:opacity-50 flex flex-col items-center"
        >
          <Menu className="h-5 w-5 mb-1" />
          <span>Menu</span>
        </button>
        
        <button
          onClick={onBack}
          disabled={isTransmitting}
          className="p-3 bg-gray-200 text-secondary rounded-lg shadow-sm hover:shadow-md remote-button font-medium text-sm disabled:opacity-50 flex flex-col items-center"
        >
          <ArrowLeft className="h-5 w-5 mb-1" />
          <span>Back</span>
        </button>
        
        <button
          onClick={onHome}
          disabled={isTransmitting}
          className="p-3 bg-gray-200 text-secondary rounded-lg shadow-sm hover:shadow-md remote-button font-medium text-sm disabled:opacity-50 flex flex-col items-center"
        >
          <Home className="h-5 w-5 mb-1" />
          <span>Home</span>
        </button>
      </div>
    </div>
  );
}
