import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingCreature = ({ 
  position, 
  targetPosition, 
  onEatEmoji, 
  mood = 8,
  size = 80, 
  gameAreaBounds,
  isMoving,
  moveDirection,
  isEating,
  gameOver = false
}) => {
  const creatureRef = useRef(null);
  const [legOffset, setLegOffset] = useState(0);
  
  // Colors for the creature
  const bodyColor = "#FF6B6B";
  const eyeColor = "#333333";
  const mouthColor = "#333333";
  
  // Add vomit animation for wrong emoji
  const [isVomiting, setIsVomiting] = useState(false);

  // Random movement animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLegOffset(prev => (prev + 1) % 4); // 4 steps in walking animation
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Check for emoji eating
  useEffect(() => {
    if (targetPosition && creatureRef.current && !isEating && !isVomiting) {
      const rect = creatureRef.current.getBoundingClientRect();
      const creatureCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      const distance = Math.sqrt(
        Math.pow((rect.left + rect.width/2) - targetPosition.x, 2) +
        Math.pow((rect.top + rect.height/2) - targetPosition.y, 2)
      );

      if (distance < size/2 +20) {
        setTimeout(() => {
          onEatEmoji();
        }, 600);
      }
    }
  }, [position, targetPosition, onEatEmoji, size, isEating, isVomiting]);
  
  // Get facial expressions based on mood level or gameOver state
  const getFacialFeatures = () => {
    // If game is over, show defeated/dead appearance
    if (gameOver) {
      return {
        eyes: (
          <>
            <path d="M35 40 L 45 50" stroke={eyeColor} strokeWidth="3" />
            <path d="M35 50 L 45 40" stroke={eyeColor} strokeWidth="3" />
            <path d="M55 40 L 65 50" stroke={eyeColor} strokeWidth="3" />
            <path d="M55 50 L 65 40" stroke={eyeColor} strokeWidth="3" />
          </>
        ),
        mouth: "M40 70C45 65 55 65 60 70" // Deep frown
      };
    }
    
    // Otherwise convert numeric mood to descriptive state
    let moodState = 'happy';
    
    // Map numeric mood to state
    if (typeof mood === 'number') {
      if (mood >= 9) moodState = 'ecstatic';
      else if (mood >= 7) moodState = 'happy';
      else if (mood >= 5) moodState = 'neutral';
      else if (mood >= 3) moodState = 'sad';
      else moodState = 'crying';
    } else {
      // If mood is already a string, use it directly
      moodState = mood;
    }

    // console.log('Current mood:', mood, 'Mood state:', moodState);
    
    switch(moodState) {
      case 'ecstatic':
        return {
          eyes: (
            <>
              <path d="M35 45 C 35 40, 45 40, 45 45" stroke={eyeColor} strokeWidth="3" fill="none" />
              <path d="M55 45 C 55 40, 65 40, 65 45" stroke={eyeColor} strokeWidth="3" fill="none" />
              <circle cx="40" cy="43" r="2" fill={eyeColor} />
              <circle cx="60" cy="43" r="2" fill={eyeColor} />
            </>
          ),
          mouth: "M40 65C45 72 55 72 60 65" // Big smile
        };
      case 'happy':
        return {
          eyes: (
            <>
              <circle cx="40" cy="45" r="5" fill={eyeColor} />
              <circle cx="60" cy="45" r="5" fill={eyeColor} />
            </>
          ),
          mouth: "M40 65C45 70 55 70 60 65" // Regular smile
        };
      case 'neutral':
        return {
          eyes: (
            <>
              <ellipse cx="40" cy="45" rx="5" ry="4" fill={eyeColor} />
              <ellipse cx="60" cy="45" rx="5" ry="4" fill={eyeColor} />
              <line x1="35" y1="40" x2="45" y2="40" stroke={eyeColor} strokeWidth="2" />
              <line x1="55" y1="40" x2="65" y2="40" stroke={eyeColor} strokeWidth="2" />
            </>
          ),
          mouth: "M40 65C45 65 55 65 60 65" // Straight line
        };
      case 'sad':
      case 'angry':
        return {
          eyes: (
            <>
              <path d="M35 40 L 45 45" stroke={eyeColor} strokeWidth="3" />
              <path d="M55 45 L 65 40" stroke={eyeColor} strokeWidth="3" />
            </>
          ),
          mouth: "M40 68C45 65 55 65 60 68" // Frown
        };
      case 'crying':
        return {
          eyes: (
            <>
              <ellipse cx="40" cy="45" rx="5" ry="3" fill={eyeColor} />
              <ellipse cx="60" cy="45" rx="5" ry="3" fill={eyeColor} />
              <path d="M38 50 C 38 55, 36 60, 34 65" stroke="#4FACFE" strokeWidth="2" fill="none" />
              <path d="M62 50 C 62 55, 64 60, 66 65" stroke="#4FACFE" strokeWidth="2" fill="none" />
              <circle cx="34" cy="65" r="2" fill="#4FACFE" />
              <circle cx="66" cy="65" r="2" fill="#4FACFE" />
            </>
          ),
          mouth: "M40 70C45 65 55 65 60 70" // Deep frown
        };
      default:
        return {
          eyes: (
            <>
              <circle cx="40" cy="45" r="5" fill={eyeColor} />
              <circle cx="60" cy="45" r="5" fill={eyeColor} />
            </>
          ),
          mouth: "M40 65C45 70 55 70 60 65" // Default smile
        };
    }
  };

  const facialFeatures = getFacialFeatures();

  // Special animations for when the game is over
  const gameOverAnimation = gameOver ? {
    rotate: [0, -5, 5, -5, 5, 0],
    y: [0, 5, -5, 5, -5, 0],
    scale: [1, 0.95, 0.98, 0.95, 0.98, 1],
  } : {};

  return (
    <>
    {/* Eating radius highlight */}
    <div
      style={{
        position: 'absolute',
        left: position.x ,
        top: position.y ,
        width: 150,
        height: 150,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 0, 0.1)', // צהוב שקוף מאוד
        pointerEvents: 'none',
        zIndex: 10
      }}
    />
    <motion.div
      ref={creatureRef}
      className="absolute"
      style={{
        width: size,
        height: size,
        left: position.x - size/2,
        top: position.y - size/2,
        zIndex: 20
      }}
      animate={gameOver ? {
        y: [0, 10, 0],
        rotate: [0, 5, -5, 5, -5, 0]
      } : {}}
      transition={gameOver ? {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      } : {}}
    >
    
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* Shadow */}
        <ellipse cx="50" cy="95" rx="30" ry="5" fill="rgba(0,0,0,0.2)" />
        
        {/* Legs */}
        <motion.g animate={gameOver ? { y: 5 } : {}}>
          {/* Left leg */}
          <motion.path
            d={`M35 75 Q ${35 + Math.sin(legOffset * Math.PI/2) * 5} ${85 + Math.cos(legOffset * Math.PI/2) * 5} 35 90`}
            stroke="#000000"
            strokeWidth="3"
            fill="none"
            animate={gameOver ? { pathLength: 0.8, y: 5 } : {}}
          />
          {/* Right leg */}
          <motion.path
            d={`M65 75 Q ${65 + Math.sin((legOffset + 2) * Math.PI/2) * 5} ${85 + Math.cos((legOffset + 2) * Math.PI/2) * 5} 65 90`}
            stroke="#000000"
            strokeWidth="3"
            fill="none"
            animate={gameOver ? { pathLength: 0.8, y: 5 } : {}}
          />
        </motion.g>
        
        {/* Body */}
        <motion.path 
          d="M25 50C25 30 40 20 50 20C60 20 75 30 75 50C75 70 65 80 50 80C35 80 25 70 25 50Z" 
          fill={gameOver ? "#E37B7B" : "#FF6B6B"} 
          stroke="#000000" 
          strokeWidth="4"
          animate={isEating ? {
            scale: [1, 1.2, 1],
            y: [0, -10, 0]
          } : gameOver ? {
            scale: [1, 0.98, 1, 0.98, 1],
            y: [0, 2, 0, 2, 0]
          } : {}}
          transition={{ duration: gameOver ? 2 : 1, repeat: gameOver ? Infinity : 0 }}
        />
        
        {/* Eyes and Mouth */}
        <motion.g
          animate={isEating ? {
            scale: [1, 0.5, 1],
            y: [0, -2, 0]
          } : {}}
        >
          {facialFeatures.eyes}
          <path 
            d={facialFeatures.mouth}
            fill="none" 
            stroke="#333333" 
            strokeWidth="3" 
            strokeLinecap="round"
            animate={isEating ? {
              d: [
                facialFeatures.mouth,
                "M35 65C45 75 55 75 65 65",
                facialFeatures.mouth
              ]
            } : {}}
            transition={{ duration: 1 }}
          />
        </motion.g>

        {/* Game over specific - additional elements */}
        {gameOver && (
          <>
            <motion.path 
              d="M45 35C45 33 55 33 55 35" 
              stroke="#333" 
              strokeWidth="2" 
              fill="none"
              animate={{ y: [0, 2, 0, 2, 0], pathLength: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            
            <motion.path 
              d="M40 55C38 60 62 60 60 55" 
              stroke="#333" 
              strokeWidth="2" 
              fill="none"
              animate={{ pathLength: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 4 }}
            />
          </>
        )}

        {/* Sweat drops for nervous/crying */}
        {(mood <= 5 || gameOver) && (
          <>
            <motion.circle 
              cx="25" 
              cy="50" 
              r="2" 
              fill="#4FACFE"
              animate={{
                y: [0, 10, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
            {gameOver && (
              <motion.circle 
                cx="75" 
                cy="50" 
                r="2" 
                fill="#4FACFE"
                animate={{
                  y: [0, 10, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: 0.5
                }}
              />
            )}
          </>
        )}
        
        {/* Antenna */}
        <motion.path 
          d="M50 20C50 10 45 5 50 0" 
          fill="none" 
          stroke="#000000" 
          strokeWidth="2"
          animate={isEating ? {
            d: [
              "M50 20C50 10 45 5 50 0",
              "M50 25C50 15 45 10 50 5",
              "M50 20C50 10 45 5 50 0"
            ]
          } : gameOver ? {
            rotate: [-10, -20, -10],
            y: [0, -2, 0]
          } : {
            rotate: [0, 5, -5, 0],
          }}
          style={{ transformOrigin: '50px 20px' }}
          transition={{ 
            duration: isEating ? 0.8 : gameOver ? 2 : 4,
            repeat: isEating ? 0 : Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.circle 
          cx="50" cy="0" r="4" fill={gameOver ? "#E37B7B" : bodyColor} stroke="#000000" strokeWidth="2"
          animate={isEating ? {
            cy: [0, 5, 0],
            r: [4, 5, 4]
          } : gameOver ? {
            scale: [1, 0.8, 1],
            y: [0, -2, 0]
          } : {}}
          transition={{ ease: "easeInOut", repeat: gameOver ? Infinity : 0, duration: gameOver ? 2 : 0.8 }}
        />
        
        {/* Game over specific - ghost effect */}
        {gameOver && (
          <motion.g 
            animate={{ opacity: [0, 0.2, 0], y: [-5, -15, -25] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <path 
              d="M25 50C25 30 40 20 50 20C60 20 75 30 75 50C75 70 65 80 50 80C35 80 25 70 25 50Z" 
              fill="#E37B7B" 
              opacity="0.3"
            />
            <ellipse cx="40" cy="45" rx="5" ry="3" fill="#333" opacity="0.3" />
            <ellipse cx="60" cy="45" rx="5" ry="3" fill="#333" opacity="0.3" />
          </motion.g>
        )}
        
        {/* Eating animation elements */}
        <AnimatePresence>
          {isEating && (
            <>
              <motion.circle
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: [0, 30, 40], opacity: [0, 0.5, 0] }}
                exit={{ r: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                cx="50" cy="50" fill="#FFDE59"
              />
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ transformOrigin: '50px 50px' }}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <motion.path
                    key={i}
                    d={`M 50 50 L ${50 + 25 * Math.cos(i * Math.PI / 4)} ${50 + 25 * Math.sin(i * Math.PI / 4)}`}
                    stroke="#FFA41B"
                    strokeWidth="4"
                    animate={{ 
                      strokeWidth: [2, 4, 1],
                      pathLength: [0, 0.8, 1]
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                ))}
              </motion.g>
              
              {/* Multiple animated stars */}
              {[...Array(5)].map((_, i) => (
                <motion.g key={`star-${i}`}>
                  <motion.text
                    initial={{ opacity: 0, y: 0, x: (i-2)*20 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      y: [-10, -30 - i*10],
                      x: [(i-2)*20, (i-2)*30]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: i * 0.1,
                      ease: "easeOut" 
                    }}
                    x="50" y="40" textAnchor="middle" fontSize="12" fontWeight="bold"
                    fill={["#FF6B6B", "#4FACFE", "#FFDE59", "#43E97B", "#A259FF"][i]}
                  >
                    {["YUM!", "TASTY!", "MMMMM!", "DELISH!", "YIPPEE!"][i]}
                  </motion.text>
                  
                  <motion.path
                    d="M 0,0 L 5,10 L 0,5 L -5,10 L 0,0"
                    fill={["#FF6B6B", "#4FACFE", "#FFDE59", "#43E97B", "#A259FF"][i]}
                    initial={{ scale: 0, x: 50, y: 50 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      x: [50, 50 + (i-2)*25],
                      y: [50, 30 - i*10],
                      rotate: [0, i % 2 === 0 ? 180 : -180]
                    }}
                    exit={{ scale: 0 }}
                    transition={{ 
                      duration: 0.8,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                  />
                </motion.g>
              ))}
            </>
          )}
        </AnimatePresence>
              
        {/* Add vomit effect */}
        <AnimatePresence>
          {isVomiting && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <svg width="100" height="100" viewBox="0 0 100 100">
                <defs>
                  <radialGradient id="vomitGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(185, 220, 35, 0.8)" />
                    <stop offset="70%" stopColor="rgba(141, 189, 37, 0.6)" />
                    <stop offset="100%" stopColor="rgba(141, 189, 37, 0)" />
                  </radialGradient>
                </defs>
                <motion.path
                  d="M50,10 C70,15 80,30 85,45 C90,60 85,75 70,85 C55,95 35,90 20,80 C5,70 5,50 15,35 C25,20 40,15 50,10 Z"
                  fill="url(#vomitGradient)"
                  animate={{
                    d: [
                      "M50,10 C70,15 80,30 85,45 C90,60 85,75 70,85 C55,95 35,90 20,80 C5,70 5,50 15,35 C25,20 40,15 50,10 Z",
                      "M50,15 C65,20 75,35 80,50 C85,65 80,80 65,90 C50,100 30,95 15,85 C0,75 0,55 10,40 C20,25 35,20 50,15 Z",
                      "M50,10 C70,15 80,30 85,45 C90,60 85,75 70,85 C55,95 35,90 20,80 C5,70 5,50 15,35 C25,20 40,15 50,10 Z"
                    ]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
    </>
  );
};

export default FloatingCreature;