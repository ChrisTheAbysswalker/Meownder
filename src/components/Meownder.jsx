import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "./Header";
import Stats from "./Stats";
import CardStack from "./CardStack";
import ActionButtons from "./ActionButtons";
import DebugInfo from "./DebugInfo";

const Meownder = () => {
    const [currentCards, setCurrentCards] = useState([]);
    const [preloadedImage, setPreloadedImage] = useState(null);
    const [likeCount, setLikeCount] = useState(0);
    const [nopeCount, setNopeCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [currentBatch, setCurrentBatch] = useState(0);
    const [dragState, setDragState] = useState({
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        deltaX: 0,
        showReaction: false,
        reactionType: "",
    });

    const cardStackRef = useRef(null);

    const config = {
        maxCards: 5,
        swipeThreshold: 3,
        dragThreshold: 100,
        imageTimeout: 10000,
    };

    // Fetch de un solo gato
    const fetchSingleCat = useCallback(async () => {
        try {
            const response = await fetch("https://meownder-backend.onrender.com/api/cats?count=1");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            console.log(data);

            return Array.isArray(data.urls) && data.urls.length > 0 ? data.urls[0] : null;
        } catch (error) {
            console.error("Error fetching cat:", error);
            return null;
        }
    }, []);

    // Precarga de una imagen
    const preloadImage = useCallback(async (url) => {
        if (!url) return null;
        return new Promise((resolve, reject) => {
            const img = new Image();
            const timestamp = Date.now() + Math.random();

            const timeoutId = setTimeout(() => reject(new Error("Image load timeout")), config.imageTimeout);

            img.onload = () => {
                clearTimeout(timeoutId);
                resolve({
                    id: `cat-${timestamp}`,
                    url,
                    element: img,
                    timestamp,
                });
            };

            img.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error("Failed to load image"));
            };

            img.src = url;
        });
    }, [config.imageTimeout]);

    // Cargar la próxima imagen en preloadedImage
    const loadNextImage = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const url = await fetchSingleCat();
            if (url) {
                const preloaded = await preloadImage(url);
                setPreloadedImage(preloaded);
                setCurrentBatch(prev => prev + 1);
            }
        } catch (err) {
            console.error("Error loading next image:", err);
        } finally {
            setIsLoading(false);
        }
    }, [fetchSingleCat, preloadImage, isLoading]);

    // Crear card a partir de la imagen precargada
    const createCardFromPreloaded = useCallback(() => {
        if (!preloadedImage) return null;
        const newCard = {
            id: preloadedImage.id,
            imageUrl: preloadedImage.url,
            timestamp: preloadedImage.timestamp,
            isLoaded: true,
        };
        setCurrentCards(prev => [newCard, ...prev.slice(0, config.maxCards - 1)]);
        setPreloadedImage(null);
        // Cargar la siguiente imagen automáticamente
        loadNextImage();
        return newCard;
    }, [preloadedImage, config.maxCards, loadNextImage]);

    // Swipe de card
    const swipeCard = useCallback((direction) => {
        if (currentCards.length === 0) return;

        if (direction === "right") setLikeCount(p => p + 1);
        else setNopeCount(p => p + 1);

        setTimeout(() => {
            setCurrentCards(prev => prev.slice(0, -1));
        }, 600);

        setTimeout(() => createCardFromPreloaded(), 200);
    }, [currentCards, createCardFromPreloaded]);

    // Efectos iniciales
    useEffect(() => { loadNextImage(); }, []);
    useEffect(() => {
        if (preloadedImage && currentCards.length === 0) {
            createCardFromPreloaded();
        }
    }, [preloadedImage, currentCards.length, createCardFromPreloaded]);

    return (
        <div className="h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-purple-700 flex flex-col items-center justify-center p-4">
            <Header />
            <Stats likeCount={likeCount} nopeCount={nopeCount} />

            <CardStack
                ref={cardStackRef}
                currentCards={currentCards}
                dragState={dragState}
                setDragState={setDragState}
                swipeCard={swipeCard}
                config={config}
            />

            <ActionButtons swipeCard={swipeCard} />

            <DebugInfo
                currentCards={currentCards}
                preloadedImages={preloadedImage ? [preloadedImage] : []}
                currentBatch={currentBatch}
                isLoading={isLoading}
            />
        </div>
    );
};

export default Meownder;
