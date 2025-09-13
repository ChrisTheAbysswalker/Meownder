const ActionButtons = ({ swipeCard }) => (
    <div className="flex gap-8">
        <button
            onClick={() => swipeCard("left")}
            className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center text-2xl"
        >
            👎
        </button>
        <button
            onClick={() => swipeCard("right")}
            className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center text-2xl"
        >
            ❤️
        </button>
    </div>
);

export default ActionButtons;
