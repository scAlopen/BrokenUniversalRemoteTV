import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationControlsProps {
  onNavUp: () => void;
  onNavDown: () => void;
  onNavLeft: () => void;
  onNavRight: () => void;
  onOK: () => void;
  isTransmitting: boolean;
}

export function NavigationControls({
  onNavUp,
  onNavDown,
  onNavLeft,
  onNavRight,
  onOK,
  isTransmitting
}: NavigationControlsProps) {
  return (
    <div className="px-4 pb-4">
      <div className="bg-gray-100 rounded-2xl p-6">
        <div className="relative w-32 h-32 mx-auto">
          {/* Navigation Ring */}
          <div className="absolute inset-0">
            {/* Up */}
            <button
              onClick={onNavUp}
              disabled={isTransmitting}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary text-white rounded-full shadow-md hover:shadow-lg remote-button disabled:opacity-50"
            >
              <ChevronUp className="h-5 w-5 mx-auto" />
            </button>
            
            {/* Down */}
            <button
              onClick={onNavDown}
              disabled={isTransmitting}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary text-white rounded-full shadow-md hover:shadow-lg remote-button disabled:opacity-50"
            >
              <ChevronDown className="h-5 w-5 mx-auto" />
            </button>
            
            {/* Left */}
            <button
              onClick={onNavLeft}
              disabled={isTransmitting}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-primary text-white rounded-full shadow-md hover:shadow-lg remote-button disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5 mx-auto" />
            </button>
            
            {/* Right */}
            <button
              onClick={onNavRight}
              disabled={isTransmitting}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-primary text-white rounded-full shadow-md hover:shadow-lg remote-button disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5 mx-auto" />
            </button>
            
            {/* Center OK Button */}
            <button
              onClick={onOK}
              disabled={isTransmitting}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-success text-white rounded-full shadow-lg hover:shadow-xl remote-button font-bold disabled:opacity-50"
            >
              OK
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">Navigation</p>
      </div>
    </div>
  );
}
