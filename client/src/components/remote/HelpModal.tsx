import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Smartphone, Bluetooth, Zap, Info } from 'lucide-react';

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How to Use</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Setup Instructions */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Setup</h3>
            </div>
            <ol className="text-sm text-gray-600 space-y-1 ml-7 list-decimal">
              <li>Select your TV brand from the dropdown</li>
              <li>Choose your connection method in Settings</li>
              <li>Point your device at the TV and press buttons</li>
            </ol>
          </div>
          
          {/* Bluetooth Setup */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Bluetooth className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Bluetooth IR Blaster</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-2 ml-7">
              <p>For best results, use an external IR blaster device:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>More reliable transmission</li>
                <li>Better range and power</li>
                <li>Works with all supported TVs</li>
              </ul>
            </div>
          </div>
          
          {/* Phone IR */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Phone IR Blaster</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-2 ml-7">
              <p>Some phones have built-in IR blasters. If yours doesn't:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>IR codes will be displayed</li>
                <li>Use with universal remote apps</li>
                <li>Program into learning remotes</li>
              </ul>
            </div>
          </div>
          
          {/* Troubleshooting */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Troubleshooting</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-1 ml-7">
              <p><strong>Commands not working?</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Try different TV brands</li>
                <li>Point directly at TV sensor</li>
                <li>Remove obstacles between device and TV</li>
                <li>Ensure TV is powered on</li>
              </ul>
            </div>
          </div>
          
          {/* Supported Brands */}
          <div>
            <h3 className="font-medium mb-2">Supported Brands</h3>
            <div className="text-sm text-gray-600 ml-4">
              <p>Samsung, LG, Sony, TCL, Hisense, Vizio, Philips, and more</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
