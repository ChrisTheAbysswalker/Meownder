import React, { forwardRef } from "react";
import Card from "./Card";

const CardStack = forwardRef(({ currentCards, dragState, setDragState, swipeCard }, ref) => {
    return (
        <div className="relative w-full max-w-sm h-96 mb-8">
            <div ref={ref} className="relative w-full h-full perspective-1000">
                {currentCards.map((card, index) => (
                    <Card
                        key={card.id}
                        card={card}
                        index={index}
                        currentCards={currentCards}
                        dragState={dragState}
                        setDragState={setDragState}
                        swipeCard={swipeCard}
                    />
                ))}
            </div>
        </div>
    );
});

export default CardStack;
