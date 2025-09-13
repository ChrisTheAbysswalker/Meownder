const DebugInfo = ({ currentCards, preloadedImages, currentBatch, isLoading }) => (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs font-mono p-3 rounded-lg">
        <div>📊 Debug Info</div>
        <div>Cards: {currentCards.length}</div>
        <div>Preloaded: {preloadedImages.length}</div>
        <div>Batch: {currentBatch}</div>
        <div>Loading: {isLoading ? "⏳" : "✅"}</div>
        <div>Backend: Go API 🚀</div>
    </div>
);

export default DebugInfo;
