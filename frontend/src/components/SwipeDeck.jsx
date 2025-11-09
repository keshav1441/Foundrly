import { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import RequestMessageModal from './RequestMessageModal';

const SwipeDeck = forwardRef(function SwipeDeck({ onIdeaClick, ...props }, ref) {
  const [ideas, setIdeas] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [isLaptop, setIsLaptop] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [clickedButton, setClickedButton] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [pendingRequestIdea, setPendingRequestIdea] = useState(null);
  const swipeDirectionRef = useRef(null);
  const exitingCardIdRef = useRef(null);
  const exitingCardDirectionRef = useRef(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  // Only show indicators when actively dragging (x is beyond a small threshold)
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);

  useEffect(() => {
    loadIdeas();
    
    // Check screen size
    const checkScreenSize = () => {
      setIsLaptop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const response = await api.getIdeas();
      setIdeas(response.data);
      setCurrentIndex(0); // Reset to first card when reloading
      // Reset swipe-related state
      setSwipeDirection(null);
      swipeDirectionRef.current = null;
      exitingCardIdRef.current = null;
      exitingCardDirectionRef.current = null;
      setClickedButton(null);
      x.set(0);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expose reload function to parent component
  useImperativeHandle(ref, () => ({
    reloadIdeas: loadIdeas
  }));

  const handleSwipe = useCallback(async (direction, isDragSwipe = false) => {
    if (currentIndex >= ideas.length) return;

    const currentIdea = ideas[currentIndex];
    
    // Track the exiting card and its direction
    exitingCardIdRef.current = currentIdea._id;
    exitingCardDirectionRef.current = direction;
    
    if (isDragSwipe) {
      // For drag swipes, immediately trigger exit - exit animation will handle x movement
      swipeDirectionRef.current = direction;
      setSwipeDirection(direction);
      setCurrentIndex(prev => prev + 1);
    } else {
      // For button clicks, show indicator briefly then immediately trigger exit
      setClickedButton(direction);
      const indicatorOffset = direction === 'right' ? 80 : -80;
      x.set(indicatorOffset);
      setIsDragging(true);
      
      // Very brief moment to show indicator, then immediately trigger exit
      // Exit animation will smoothly animate from indicator position to exit
      setTimeout(() => {
        swipeDirectionRef.current = direction;
        setSwipeDirection(direction);
        setCurrentIndex(prev => prev + 1);
      }, 100);
    }

    try {
      // Store the idea before making the API call (in case currentIndex changes)
      const ideaToSwipe = { ...currentIdea };
      
      console.log('=== SWIPE DEBUG ===');
      console.log('Idea being swiped:', ideaToSwipe);
      console.log('Idea submittedBy:', ideaToSwipe.submittedBy);
      console.log('Direction:', direction);
      console.log('Is drag swipe:', isDragSwipe);
      
      const response = await api.swipe(ideaToSwipe._id, direction);
      console.log('=== FRONTEND SWIPE RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data?.needsRequest:', response.data?.needsRequest);
      console.log('Type of response.data:', typeof response.data);
      console.log('response.data keys:', Object.keys(response.data || {}));
      
      // If swiping right on someone else's idea, show request modal
      if (direction === 'right') {
        console.log('Direction is RIGHT, checking needsRequest...');
        
        // Check multiple ways the response might be structured
        const needsRequest = response.data?.needsRequest || 
                            response?.data?.needsRequest || 
                            (response.data && response.data.needsRequest === true);
        
        console.log('needsRequest value:', needsRequest);
        console.log('Boolean check:', needsRequest === true);
        console.log('Truthy check:', !!needsRequest);
        
        if (needsRequest === true || needsRequest === 'true') {
          console.log('✅✅✅ REQUEST NEEDED - SHOWING MODAL NOW ✅✅✅');
          console.log('Idea to request:', ideaToSwipe);
          
          // Show modal immediately
          setPendingRequestIdea(ideaToSwipe);
          setShowRequestModal(true);
          
          // Force a re-render check
          setTimeout(() => {
            console.log('After 100ms - Modal should be visible');
            console.log('Checking if modal is in DOM...');
          }, 100);
          
          // Continue with normal cleanup
          const cleanupDelay = isDragSwipe ? 800 : 900;
          setTimeout(() => {
            setSwipeDirection(null);
            swipeDirectionRef.current = null;
            exitingCardIdRef.current = null;
            exitingCardDirectionRef.current = null;
            setClickedButton(null);
            x.set(0);
          }, cleanupDelay);
          return;
        } else {
          console.log('❌ needsRequest is false or undefined');
          console.log('Response structure:', JSON.stringify(response.data, null, 2));
        }
      }
      
      // Reset after a delay to ensure exit animation has processed
      setTimeout(() => {
        setSwipeDirection(null);
        swipeDirectionRef.current = null;
        exitingCardIdRef.current = null;
        exitingCardDirectionRef.current = null;
        setClickedButton(null);
        x.set(0);
      }, 600);
    } catch (error) {
      console.error('Swipe failed:', error);
      // Revert index on error
      setCurrentIndex(prev => Math.max(0, prev - 1));
      setSwipeDirection(null);
      swipeDirectionRef.current = null;
      exitingCardIdRef.current = null;
      exitingCardDirectionRef.current = null;
      setClickedButton(null);
      x.set(0);
    }
  }, [currentIndex, ideas, x]);

  // Reset motion values when a new card appears
  useEffect(() => {
    // Reset motion values when a new card appears
    // Don't reset swipeDirection here - it's needed for the exit animation
    // and will be reset in handleSwipe after the animation completes
    x.set(0);
    setIsDragging(false);
    setClickedButton(null);
  }, [currentIndex, x]);

  // Debug modal state
  useEffect(() => {
    console.log('🔔 Modal state changed - showRequestModal:', showRequestModal, 'pendingRequestIdea:', pendingRequestIdea);
    if (showRequestModal) {
      console.log('✅✅✅ MODAL STATE IS TRUE - MODAL SHOULD BE VISIBLE ✅✅✅');
      console.log('Pending idea:', pendingRequestIdea);
    }
  }, [showRequestModal, pendingRequestIdea]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold) {
      handleSwipe('right', true);
    } else if (info.offset.x < -swipeThreshold) {
      handleSwipe('left', true);
    } else {
      x.set(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-2 border-netflixRed border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (currentIndex >= ideas.length) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-light text-textLight mb-4">
            No more ideas
          </h2>
          <p className="text-textGray mb-6 md:mb-8 font-light">Check back later for more terrible startup ideas</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentIndex(0);
              loadIdeas();
            }}
            className="bg-netflixRed text-white px-8 py-3 rounded-md font-medium"
          >
            Reload Ideas
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentIdea = ideas[currentIndex];

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      {/* Card Stack with Side Buttons for Laptop */}
      <div className="relative flex-1 flex items-center justify-center min-h-0">

        {/* Card */}
        <AnimatePresence mode="wait" custom={swipeDirection}>
          <motion.div
            key={currentIdea._id}
            custom={swipeDirection}
            drag={!swipeDirection ? "x" : false}
            dragConstraints={{ left: -200, right: 200 }}
            dragElastic={0.7}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ 
              x: x, 
              rotate: rotate,
              zIndex: 1,
              pointerEvents: swipeDirection ? 'none' : 'auto'
            }}
            initial={{ scale: 0.9, opacity: 0, x: 0, rotate: 0 }}
            animate={{
              scale: 1, 
              opacity: 1, 
              x: 0, 
              rotate: 0
            }}
            exit={(direction) => {
              // Use direction from custom prop, fallback to exitingCardDirectionRef if needed
              const exitDirection = direction || exitingCardDirectionRef.current || 'left';
              const exitX = exitDirection === 'right' ? 400 : -400;
              
              // Animate x motion value to exit position
              animate(x, exitX, {
                type: 'spring',
                stiffness: 400,
                damping: 25,
                mass: 0.5
              });
              
              return {
                scale: 0.9,
                opacity: 0,
                rotate: exitDirection === 'right' ? 20 : -20,
              };
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              mass: 0.5
            }}
            className="absolute w-full cursor-grab active:cursor-grabbing"
          >
            <div className="relative">
              {/* Swipe Indicators - All screens - Show when dragging or button clicked */}
              {(isDragging || clickedButton) && (
                <>
                  <motion.div
                    style={{ opacity: likeOpacity }}
                    className="absolute inset-0 bg-green-500/20 rounded-lg border-4 border-green-500 flex items-center justify-center pointer-events-none z-10"
                  >
                    <div className="bg-green-500 text-white px-8 py-4 rounded-full font-bold text-2xl rotate-12">
                      LIKE
                    </div>
                  </motion.div>
                  <motion.div
                    style={{ opacity: passOpacity }}
                    className="absolute inset-0 bg-red-500/20 rounded-lg border-4 border-red-500 flex items-center justify-center pointer-events-none z-10"
                  >
                    <div className="bg-red-500 text-white px-8 py-4 rounded-full font-bold text-2xl -rotate-12">
                      PASS
                    </div>
                  </motion.div>
                </>
              )}

              {/* Card Content */}
              <motion.div
                whileHover={isLaptop ? { y: -5 } : {}}
                onClick={(e) => {
                  // Only trigger click if not dragging and not clicking on swipe buttons
                  if (!isDragging && !clickedButton && e.target.closest('button') === null) {
                    onIdeaClick?.(currentIdea);
                  }
                }}
                className="bg-darkBg/50 backdrop-blur-xl rounded-lg overflow-hidden border border-gray-900 h-full flex flex-col cursor-pointer"
              >
                {/* Header Section */}
                <div className="relative flex-1 min-h-[200px] bg-gradient-to-br from-black via-darkBg to-black flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-netflixRed/5" />
                  <div className="relative z-10 text-center p-4 md:p-8">
                    <motion.h2
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-3xl md:text-5xl font-light text-textLight mb-4 md:mb-6 tracking-tight"
                    >
                      {currentIdea.name}
                    </motion.h2>
                    {currentIdea.tags && currentIdea.tags.length > 0 && (
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center justify-center gap-2"
                      >
                        {currentIdea.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1.5 bg-netflixRed/20 backdrop-blur-sm rounded-md border border-netflixRed/30"
                          >
                            <span className="text-xs font-medium text-textLight uppercase tracking-wider">
                              {tag}
                            </span>
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 md:p-8 flex-shrink-0 relative">
                  {/* Description with Icons - Laptop only */}
                  {isLaptop ? (
                    <div className="relative">
                      {/* Reject Icon - Left side */}
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          scale: clickedButton === 'left' ? [1, 1.3, 1] : 1,
                          rotate: clickedButton === 'left' ? [0, 180, 0] : 0
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSwipe('left')}
                        transition={{ duration: 0.3 }}
                        className="absolute left-0 top-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-900/30 border-2 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-900/50 hover:border-red-500 transition z-20 -translate-x-2"
                      >
                        <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                      {/* Accept Icon - Right side */}
                      <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          scale: clickedButton === 'right' ? [1, 1.3, 1] : 1,
                          rotate: clickedButton === 'right' ? [0, -180, 0] : 0
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSwipe('right')}
                        transition={{ duration: 0.3 }}
                        className="absolute right-0 top-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-900/30 border-2 border-green-500 flex items-center justify-center text-green-500 hover:bg-green-900/50 hover:border-green-500 transition z-20 translate-x-2"
                      >
                        <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.button>
                      <p className="text-textLight text-base md:text-lg mb-4 md:mb-6 font-light leading-relaxed line-clamp-2 pr-16 md:pr-20 pl-16 md:pl-20">
                        {currentIdea.oneLiner}
                      </p>
                    </div>
                  ) : (
                    <p className="text-textLight text-base md:text-lg mb-4 md:mb-6 font-light leading-relaxed line-clamp-2">
                      {currentIdea.oneLiner}
                    </p>
                  )}


                  <div className="flex items-center justify-between text-sm text-textGray font-light">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>{currentIdea.swipeRightCount || 0} likes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span>{currentIdea.swipeLeftCount || 0} passes</span>
                      </div>
                    </div>
                    {currentIdea.submittedBy && (
                      <div className="flex items-center gap-2">
                        <span className="text-textGray/60">by</span>
                        <Link
                          to={`/profile/${currentIdea.submittedBy._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-textLight font-medium hover:text-netflixRed transition"
                        >
                          {currentIdea.submittedBy.name || 'Anonymous'}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Buttons - Mobile/Tablet only */}
      {!isLaptop && (
        <div className="flex items-center justify-center gap-6 mt-4 mb-6 sm:mb-8 flex-shrink-0">
          <motion.button
            animate={{
              scale: clickedButton === 'left' ? [1, 1.3, 1] : 1,
              rotate: clickedButton === 'left' ? [0, 180, 0] : 0
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            transition={{ duration: 0.3 }}
            className="w-14 h-14 rounded-full bg-red-900/20 border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-900/30 hover:border-red-500/50 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>

          <motion.button
            animate={{
              scale: clickedButton === 'right' ? [1, 1.3, 1] : 1,
              rotate: clickedButton === 'right' ? [0, -180, 0] : 0
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            transition={{ duration: 0.3 }}
            className="w-14 h-14 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center text-green-500 hover:bg-green-900/30 hover:border-green-500/50 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.button>
        </div>
      )}

      {/* Request Message Modal */}
      <RequestMessageModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setPendingRequestIdea(null);
          // Advance to next card after modal closes
          setTimeout(() => {
            setSwipeDirection(null);
            swipeDirectionRef.current = null;
            exitingCardIdRef.current = null;
            exitingCardDirectionRef.current = null;
            setClickedButton(null);
            x.set(0);
          }, 100);
        }}
        idea={pendingRequestIdea}
        onRequestSent={() => {
          setShowRequestModal(false);
          setPendingRequestIdea(null);
        }}
      />
    </div>
  );
});

export default SwipeDeck;
