import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';

export function Confetti({ trigger, savedAmount = 0 }) {
  const [showMessage, setShowMessage] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(0);
  const prevTrigger = useRef(0);

  useEffect(() => {
    // Only fire if trigger actually increased (not on remove/reset)
    if (trigger > prevTrigger.current && savedAmount > 0) {
      console.log('🎉 CONFETTI BLAST TRIGGERED! Saved: ₹' + savedAmount);
      prevTrigger.current = trigger;
      
      // Capture the saved amount at this moment
      setDisplayAmount(savedAmount);
      
      // Fire confetti blast ONCE from bottom!
      
      // Initial HUGE center blast
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 1 },
        angle: 90,
        startVelocity: 65,
        gravity: 1,
        colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#F7DC6F', '#BB8FCE', '#45B7D1', '#98D8C8'],
        shapes: ['circle', 'square'],
        scalar: 1.4,
        zIndex: 99999,
      });

      // Left cannon blast
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { x: 0.2, y: 1 },
          angle: 75,
          startVelocity: 55,
          colors: ['#FF6B6B', '#4ECDC4', '#F7DC6F', '#BB8FCE'],
          zIndex: 99999,
        });
      }, 100);

      // Right cannon blast
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { x: 0.8, y: 1 },
          angle: 105,
          startVelocity: 55,
          colors: ['#FFA07A', '#45B7D1', '#FFD54F', '#85C1E2'],
          zIndex: 99999,
        });
      }, 100);

      // Show "Yeahoo!" message
      setShowMessage(true);
      const messageTimer = setTimeout(() => {
        setShowMessage(false);
      }, 2700); // Start fade-out at 2.7s (300ms fade animation)

      return () => clearTimeout(messageTimer);
    }
  }, [trigger, savedAmount]);

  return (
    <>
      {/* "Yeahoo!" Celebration Message */}
      {showMessage && (
        <div 
          className="fixed inset-0 pointer-events-none flex items-center justify-center px-4"
          style={{ 
            zIndex: 99998,
            animation: 'messageFadeOut 3s ease-in-out forwards',
          }}
        >
          <div 
            className="text-center relative"
            style={{
              animation: 'yeahooAppear 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
            }}
          >
            {/* Main Message */}
            <div 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF6B6B 50%, #BB8FCE 75%, #4ECDC4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 6px 20px rgba(255,215,0,0.6))',
                letterSpacing: '-0.02em',
              }}
            >
              Yeahoo! 🎉
            </div>
            
            {/* Savings Amount */}
            <div 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-3 px-6 py-4 rounded-2xl inline-block relative"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.95) 0%, rgba(5,150,105,0.95) 100%)',
                color: '#ffffff',
                boxShadow: '0 10px 40px rgba(16,185,129,0.5), 0 0 60px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
                animation: 'glow 1.5s ease-in-out infinite',
              }}
            >
              You Saved ₹{Number(displayAmount).toLocaleString('en-IN')}! 💰
            </div>
            
            {/* Sparkle Effects Around Message */}
            <div className="absolute -top-8 -right-8 text-4xl animate-bounce">✨</div>
            <div className="absolute -top-6 -left-10 text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</div>
            <div className="absolute -bottom-4 -right-6 text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>
            <div className="absolute -bottom-6 -left-8 text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>💫</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes yeahooAppear {
          0% {
            transform: scale(0) rotate(-15deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.15) rotate(5deg);
            opacity: 1;
          }
          70% {
            transform: scale(0.92) rotate(-3deg);
          }
          85% {
            transform: scale(1.08) rotate(2deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes messageFadeOut {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          15% {
            opacity: 1;
            transform: scale(1);
          }
          85% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 10px 40px rgba(16,185,129,0.5), 0 0 60px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
          }
          50% {
            box-shadow: 0 15px 50px rgba(16,185,129,0.7), 0 0 80px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.4);
          }
        }
      `}</style>
    </>
  );
}
