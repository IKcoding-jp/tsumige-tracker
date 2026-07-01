function RandomPickOverlay({ title }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
        <p className="text-sm text-gray-500 mb-2">選んでいます...</p>
        <p className="text-lg font-bold animate-pulse">{title}</p>
      </div>
    </div>
  );
}

export default RandomPickOverlay;
