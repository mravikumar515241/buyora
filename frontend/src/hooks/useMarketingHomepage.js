import { useQuery } from '@tanstack/react-query';
import { marketingService } from '../services/marketingService';
import { getSessionId } from '../utils/sessionId';

export function useMarketingHomepage() {
  const sessionId = getSessionId();

  return useQuery({
    queryKey: ['marketing-homepage', sessionId],
    queryFn: () => marketingService.getHomepage(sessionId),
    staleTime: 60_000,
    placeholderData: {
      announcements: [],
      sections: [],
    },
  });
}
