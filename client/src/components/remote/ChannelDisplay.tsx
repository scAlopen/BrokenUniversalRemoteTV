interface ChannelDisplayProps {
  channel: string;
  visible: boolean;
}

export function ChannelDisplay({ channel, visible }: ChannelDisplayProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-xl shadow-xl z-40">
      <div className="text-center">
        <div className="text-2xl font-bold">{channel}</div>
        <div className="text-sm opacity-75">Channel</div>
      </div>
    </div>
  );
}
