import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useArtists } from '../useArtists';
import { ArtistService } from '../../lib/api/services/artistService';

vi.mock('../../lib/api/services/artistService', () => ({
  ArtistService: {
    getArtists: vi.fn().mockResolvedValue({
      data: { artists: [], total: 0, hasMore: false },
      meta: { status: 'success', request_id: 'test', timestamp: '', version: '1.0.0', message: 'ok' }
    }),
    createArtist: vi.fn(),
    updateArtist: vi.fn(),
    deleteArtist: vi.fn()
  }
}));

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useArtists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete an artist successfully', async () => {
    (ArtistService.deleteArtist as any).mockResolvedValueOnce({
      data: { deleted: true },
      meta: { status: 'success', request_id: 'req', timestamp: '', version: '1.0.0', message: 'ok' }
    });

    const { result } = renderHook(() => useArtists(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteArtist('artist-1');
    });

    expect(ArtistService.deleteArtist).toHaveBeenCalledWith('artist-1');
  });
});
