import { Settings, HelpCircle } from 'lucide-react';

interface BottomActionsProps {
  onSettingsClick: () => void;
  onHelpClick: () => void;
}

export function BottomActions({ onSettingsClick, onHelpClick }: BottomActionsProps) {
  return (
    <div className="px-4 pb-6">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onSettingsClick}
          className="p-4 bg-gray-100 text-secondary rounded-xl shadow-sm hover:shadow-md remote-button text-center flex flex-col items-center"
        >
          <Settings className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        
        <button
          onClick={onHelpClick}
          className="p-4 bg-gray-100 text-secondary rounded-xl shadow-sm hover:shadow-md remote-button text-center flex flex-col items-center"
        >
          <HelpCircle className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Help</span>
        </button>
      </div>
    </div>
  );
}
