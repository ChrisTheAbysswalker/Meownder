const Stats = ({ likeCount, nopeCount }) => (
    <div className="flex gap-6 mb-8 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
        <div className="text-center">
            <span className="block text-xl font-bold text-gray-800">{nopeCount}</span>
            <span className="block text-sm text-gray-600">👎 Nopes</span>
        </div>

        <div className="text-center">
            <span className="block text-xl font-bold text-gray-800">{likeCount}</span>
            <span className="block text-sm text-gray-600">❤️ Likes</span>
        </div>
    </div>
);

export default Stats;
