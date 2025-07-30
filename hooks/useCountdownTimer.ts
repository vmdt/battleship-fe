import { useState, useEffect } from 'react';

interface UseCountdownTimerProps {
  startPlaceAt?: Date;
  timePlaceShip: number; // seconds
}

interface CountdownState {
  timeLeft: number; // seconds
  isTimeout: boolean;
  isActive: boolean;
}

export const useCountdownTimer = ({ startPlaceAt, timePlaceShip }: UseCountdownTimerProps): CountdownState => {
  const [countdownState, setCountdownState] = useState<CountdownState>({
    timeLeft: 0,
    isTimeout: false,
    isActive: false
  });

  useEffect(() => {
    if (!startPlaceAt || timePlaceShip <= 0) {
      setCountdownState({
        timeLeft: 0,
        isTimeout: false,
        isActive: false
      });
      return;
    }

    const calculateTimeLeft = (): number => {
      const now = new Date();
      const startTime = new Date(startPlaceAt);
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const remainingSeconds = timePlaceShip - elapsedSeconds;
      
      return Math.max(0, remainingSeconds);
    };

    const updateTimer = () => {
      const timeLeft = calculateTimeLeft();
      const isTimeout = timeLeft <= 0;
      const isActive = timeLeft > 0;

      setCountdownState({
        timeLeft,
        isTimeout,
        isActive
      });
    };

    // Calculate initial time left
    updateTimer();

    // Set up interval for countdown
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startPlaceAt, timePlaceShip]);

  return countdownState;
};

// Utility function to format seconds to MM:SS
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}; 