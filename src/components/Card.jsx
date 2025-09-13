import React from "react";

const Card = ({ card, index, currentCards, dragState, setDragState, swipeCard }) => {
    const isTopCard = index === currentCards.length - 1;
    const zIndex = currentCards.length - index;
    const scale = 1 - index * 0.05;
    const translateY = index * 8;
    const opacity = Math.max(0.7, 1 - index * 0.1);

    // --- Handlers de drag ---
    const handleDragStart = (e) => {
        if (!isTopCard) return;
        const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;

        setDragState({
            isDragging: true,
            startX: clientX,
            startY: clientY,
            currentX: clientX,
            currentY: clientY,
            deltaX: 0,
            showReaction: false,
            reactionType: "",
        });
    };

    const handleDragMove = (e) => {
        if (!dragState.isDragging || !isTopCard) return;

        const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
        const deltaX = clientX - dragState.startX;

        setDragState({
            ...dragState,
            currentX: clientX,
            currentY: clientY,
            deltaX,
            showReaction: Math.abs(deltaX) > 50,
            reactionType: deltaX > 0 ? "like" : "nope",
        });
    };

    const handleDragEnd = () => {
        if (!isTopCard) return;

        if (Math.abs(dragState.deltaX) > 100) {
            swipeCard(dragState.deltaX > 0 ? "right" : "left");
        }
        setDragState({
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            deltaX: 0,
            showReaction: false,
            reactionType: "",
        });
    };

    // --- Estilos dinámicos ---
    const transform =
        isTopCard && dragState.isDragging
            ? `translate(${dragState.deltaX}px, 0) rotate(${dragState.deltaX * 0.05}deg)`
            : `scale(${scale}) translateY(${translateY}px)`;

    return (
        <div
            className="absolute top-0 left-0 w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ zIndex, transform, opacity, transition: dragState.isDragging ? "none" : "transform 0.3s ease" }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
        >
            {/* Imagen */}
            <div className="h-4/5 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                <img src={card.imageUrl} alt="Gatito adorable" className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="h-1/5 p-4 flex flex-col justify-center items-center text-center">
                <h2 className="text-lg font-bold text-gray-800 mb-1">¿Te gusta este gato?</h2>
                <p className="text-sm text-gray-600">Desliza o usa los botones</p>
            </div>

            {/* Reacciones (LIKE / NOPE) */}
            {isTopCard && dragState.showReaction && (
                <div
                    className={`absolute top-4 ${dragState.reactionType === "like" ? "left-4 text-green-500" : "right-4 text-red-500"} font-bold text-3xl`}
                >
                    {dragState.reactionType === "like" ? "LIKE" : "NOPE"}
                </div>
            )}
        </div>
    );
};

export default Card;
