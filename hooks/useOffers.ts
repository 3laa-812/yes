"use client";

import { useState, useEffect } from 'react';
import { getAdminOffers, getActiveOffers } from '@/app/actions/offers';

export function useOffers(isAdmin = false) {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchOffers() {
      try {
        setIsLoading(true);
        const data = isAdmin ? await getAdminOffers() : await getActiveOffers();
        if (mounted) {
          setOffers(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchOffers();

    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  return { offers, isLoading, error, setOffers };
}
