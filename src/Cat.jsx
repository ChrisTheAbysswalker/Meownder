import React, { useState, useEffect, useRef, useCallback } from 'react';

const CatTinder = () => {
  // Estados del componente
  const [currentCards, setCurrentCards] = useState([]);
  const [preloadedImages, setPreloadedImages] = useState([]);
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
    reactionType: ''
  });

  // Refs para elementos DOM
  const cardStackRef = useRef(null);

  // Configuración
  const config = {
    maxCards: 5,
    batchSize: 5,
    swipeThreshold: 3,
    dragThreshold: 100,
    imageTimeout: 10000
  };

  // Función para precargar una imagen
  const preloadSingleImage = useCallback(() => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timestamp = Date.now() + Math.random();

      const timeoutId = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, config.imageTimeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve({
          id: `cat-${timestamp}`,
          url: img.src,
          element: img,
          timestamp: timestamp
        });
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load image'));
      };

      img.src = `https://cataas.com/cat?timestamp=${timestamp}`;
    });
  }, [config.imageTimeout]);

  // Precargar lote de imágenes
  const preloadImageBatch = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    console.log(`🐱 Precargando lote ${currentBatch + 1}...`);

    try {
      const promises = Array(config.batchSize).fill().map(() => preloadSingleImage());
      const results = await Promise.allSettled(promises);

      const successfulImages = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      setPreloadedImages(prev => [...prev, ...successfulImages]);
      setCurrentBatch(prev => prev + 1);

      console.log(`✅ Lote ${currentBatch + 1} cargado. Total: ${preloadedImages.length + successfulImages.length}`);
    } catch (error) {
      console.error('Error precargando lote:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentBatch, preloadSingleImage, config.batchSize, preloadedImages.length]);

  // Verificar y precargar más imágenes si es necesario
  const checkAndPreloadMore = useCallback(async () => {
    const remainingCards = currentCards.length;
    const remainingPreloaded = preloadedImages.length;

    if (remainingCards <= config.swipeThreshold &&
      remainingPreloaded < config.batchSize &&
      !isLoading) {
      console.log(`🔄 Quedan ${remainingCards} cards y ${remainingPreloaded} imágenes. Precargando más...`);
      await preloadImageBatch();
    }
  }, [currentCards.length, preloadedImages.length, isLoading, config.swipeThreshold, config.batchSize, preloadImageBatch]);

  // Crear nueva card desde imagen precargada
  const createCardFromPreloaded = useCallback(() => {
    if (preloadedImages.length === 0) return null;

    const preloadedImg = preloadedImages[0];
    const newCard = {
      id: preloadedImg.id,
      imageUrl: preloadedImg.url,
      timestamp: preloadedImg.timestamp,
      isLoaded: true
    };

    setPreloadedImages(prev => prev.slice(1));
    setCurrentCards(prev => [newCard, ...prev.slice(0, config.maxCards - 1)]);

    return newCard;
  }, [preloadedImages, config.maxCards]);

  // Crear cards iniciales
  const createInitialCards = useCallback(async () => {
    if (preloadedImages.length === 0) return;

    const cardsToCreate = Math.min(config.maxCards, preloadedImages.length);
    const newCards = [];

    for (let i = 0; i < cardsToCreate; i++) {
      const preloadedImg = preloadedImages[i];
      newCards.push({
        id: preloadedImg.id,
        imageUrl: preloadedImg.url,
        timestamp: preloadedImg.timestamp,
        isLoaded: true
      });
    }

    setCurrentCards(newCards);
    setPreloadedImages(prev => prev.slice(cardsToCreate));
  }, [preloadedImages, config.maxCards]);

  // Manejar swipe de card
  const swipeCard = useCallback(async (direction) => {
    if (currentCards.length === 0) return;

    const topCard = currentCards[currentCards.length - 1];

    // Actualizar estadísticas
    if (direction === 'right') {
      setLikeCount(prev => prev + 1);
    } else {
      setNopeCount(prev => prev + 1);
    }

    // Remover la card del estado
    setTimeout(() => {
      setCurrentCards(prev => prev.slice(0, -1));
    }, 600);

    // Verificar y precargar más imágenes
    await checkAndPreloadMore();

    // Crear nueva card
    setTimeout(() => {
      createCardFromPreloaded();
    }, 200);
  }, [currentCards, checkAndPreloadMore, createCardFromPreloaded]);

  // Manejar inicio de drag
  const handleDragStart = useCallback((e) => {
    if (currentCards.length === 0) return;

    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

    setDragState({
      isDragging: true,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      deltaX: 0,
      showReaction: false,
      reactionType: ''
    });
  }, [currentCards.length]);

  // Manejar movimiento de drag
  const handleDragMove = useCallback((e) => {
    if (!dragState.isDragging || currentCards.length === 0) return;

    e.preventDefault();
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

    const deltaX = clientX - dragState.startX;
    const deltaY = clientY - dragState.startY;

    const showReaction = Math.abs(deltaX) > 50;
    const reactionType = deltaX > 0 ? 'like' : 'nope';

    setDragState(prev => ({
      ...prev,
      currentX: clientX,
      currentY: clientY,
      deltaX,
      deltaY,
      showReaction,
      reactionType
    }));
  }, [dragState.isDragging, dragState.startX, dragState.startY, currentCards.length]);

  // Manejar fin de drag
  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return;

    const { deltaX } = dragState;

    if (Math.abs(deltaX) > config.dragThreshold) {
      swipeCard(deltaX > 0 ? 'right' : 'left');
    }

    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      showReaction: false,
      reactionType: ''
    });
  }, [dragState.isDragging, dragState.deltaX, swipeCard, config.dragThreshold]);

  // Efectos
  useEffect(() => {
    // Inicialización: precargar primer lote
    preloadImageBatch();
  }, []);

  useEffect(() => {
    // Crear cards iniciales cuando tengamos imágenes precargadas
    if (preloadedImages.length > 0 && currentCards.length === 0) {
      createInitialCards();
    }
  }, [preloadedImages.length, currentCards.length, createInitialCards]);

  useEffect(() => {
    // Event listeners para drag
    const handleMouseMove = (e) => handleDragMove(e);
    const handleTouchMove = (e) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  // Calcular estilos para la card superior
  const getTopCardStyle = () => {
    if (!dragState.isDragging) return {};

    const { deltaX, deltaY } = dragState;
    const rotation = deltaX * 0.1;
    const opacity = Math.max(0.5, 1 - Math.abs(deltaX) / 300);

    return {
      transform: `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${rotation}deg)`,
      opacity,
      transition: 'none',
      zIndex: 1000
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-purple-700 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8 text-white">
        <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">🐱 Cat Tinder</h1>
        <p className="text-lg opacity-90">Encuentra tu gato perfecto</p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-8 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
        <div className="text-center">
          <span className="block text-xl font-bold text-gray-800">{likeCount}</span>
          <span className="block text-sm text-gray-600">❤️ Likes</span>
        </div>
        <div className="text-center">
          <span className="block text-xl font-bold text-gray-800">{nopeCount}</span>
          <span className="block text-sm text-gray-600">👎 Nopes</span>
        </div>
      </div>

      {/* Game Container */}
      <div className="relative w-full max-w-sm h-96 mb-8">
        {/* Card Stack */}
        <div ref={cardStackRef} className="relative w-full h-full perspective-1000">
          {currentCards.map((card, index) => {
            const isTopCard = index === currentCards.length - 1;
            const zIndex = currentCards.length - index;
            const scale = 1 - (index * 0.05);
            const translateY = index * 8;
            const opacity = Math.max(0.7, 1 - (index * 0.1));

            return (
              <div
                key={card.id}
                className={`absolute top-0 left-0 w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300 ease-out ${isTopCard && dragState.isDragging ? '' : ''
                  }`}
                style={{
                  zIndex,
                  transform: isTopCard && dragState.isDragging
                    ? getTopCardStyle().transform || `scale(${scale}) translateY(${translateY}px)`
                    : `scale(${scale}) translateY(${translateY}px)`,
                  opacity: isTopCard && dragState.isDragging ? getTopCardStyle().opacity || opacity : opacity,
                  transition: isTopCard && dragState.isDragging ? 'none' : 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseDown={isTopCard ? handleDragStart : undefined}
                onTouchStart={isTopCard ? handleDragStart : undefined}
              >
                {/* Image */}
                <div className="h-4/5 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {card.isLoaded ? (
                    <img
                      src={card.imageUrl}
                      alt="Gatito adorable"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  )}
                </div>

                {/* Card Info */}
                <div className="h-1/5 p-4 flex flex-col justify-center items-center text-center">
                  <h2 className="text-lg font-bold text-gray-800 mb-1">¿Te gusta este gato?</h2>
                  <p className="text-sm text-gray-600">Desliza o usa los botones</p>
                </div>

                {/* Reaction Indicator */}
                {isTopCard && dragState.showReaction && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`text-6xl font-bold drop-shadow-lg ${dragState.reactionType === 'like' ? 'text-green-500' : 'text-red-500'
                      }`}>
                      {dragState.reactionType === 'like' ? '❤️' : '👎'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-8">
        <button
          onClick={() => swipeCard('left')}
          className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center text-2xl"
        >
          👎
        </button>
        <button
          onClick={() => swipeCard('right')}
          className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center text-2xl"
        >
          ❤️
        </button>
      </div>

      {/* Debug Info */}
      <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs font-mono p-3 rounded-lg">
        <div>📊 Debug Info</div>
        <div>Cards: {currentCards.length}</div>
        <div>Preloaded: {preloadedImages.length}</div>
        <div>Batch: {currentBatch}</div>
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
        <div>Backend: Go API 🚀</div>
      </div>
    </div>
  );
};

export default CatTinder;