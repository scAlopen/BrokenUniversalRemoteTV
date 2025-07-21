import { History, Check } from 'lucide-react';

interface NumberPadProps {
  onNumberPress: (number: string) => void;
  onPrevChannel: () => void;
  onEnter: () => void;
  isTransmitting: boolean;
}

export function NumberPad({ onNumberPress, onPrevChannel, onEnter, isTransmitting }: NumberPadProps) {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="px-4 pb-4">
      <div className="bg-gray-100 rounded-2xl p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Channel Numbers</h3>
        
        <div className="grid grid-cols-3 gap-3">
          {/* Numbers 1-9 */}
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => onNumberPress(num)}
              disabled={isTransmitting}
              className="w-full h-14 bg-white text-secondary rounded-xl shadow-sm hover:shadow-md remote-button font-bold text-lg disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          
          {/* Bottom row */}
          <button
            onClick={onPrevChannel}
            disabled={isTransmitting}
            className="w-full h-14 bg-white text-secondary rounded-xl shadow-sm hover:shadow-md remote-button font-bold text-lg disabled:opacity-50 flex items-center justify-center"
          >
            <History className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => onNumberPress('0')}
            disabled={isTransmitting}
            className="w-full h-14 bg-white text-secondary rounded-xl shadow-sm hover:shadow-md remote-button font-bold text-lg disabled:opacity-50"
          >
            0
          </button>
          
          <button
            onClick={onEnter}
            disabled={isTransmitting}
            className="w-full h-14 bg-white text-secondary rounded-xl shadow-sm hover:shadow-md remote-button font-bold text-lg disabled:opacity-50 flex items-center justify-center"
          >
            <Check className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
