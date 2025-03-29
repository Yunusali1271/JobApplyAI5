import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useIpLimits = () => {
  const { user } = useAuth();
  const [hasCreatedPack, setHasCreatedPack] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIpStatus = async () => {
    if (user) {
      setHasCreatedPack(false);
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/ip-tracking');
      if (!response.ok) {
        throw new Error('Failed to check IP status');
      }
      
      const data = await response.json();
      setHasCreatedPack(data.hasCreatedPack);
      return data.hasCreatedPack;
    } catch (error) {
      console.error('Error checking IP limits:', error);
      setError(error.message || 'Unknown error checking IP limits');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const recordPackCreation = async () => {
    if (user) return true;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/ip-tracking', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        if (!data.allowed) {
          setHasCreatedPack(true);
          return false;
        }
      }
      
      setHasCreatedPack(true);
      return true;
    } catch (error) {
      console.error('Error recording pack creation:', error);
      setError(error.message || 'Unknown error recording pack creation');
      return true; // Allow on error to prevent blocking legitimate users
    } finally {
      setIsLoading(false);
    }
  };

  // Check status on mount and when user changes
  useEffect(() => {
    if (!user) {
      checkIpStatus();
    } else {
      setHasCreatedPack(false);
    }
  }, [user]);

  return {
    hasCreatedPack,
    isLoading,
    error,
    checkIpStatus,
    recordPackCreation,
    canCreatePack: !hasCreatedPack || !!user
  };
}; 