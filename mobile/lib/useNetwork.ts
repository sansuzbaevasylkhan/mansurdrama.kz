import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetwork() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isConnected };
}
