import { getCached, setCache, clearCache } from '@/lib/cache';

describe('Cache System', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should store and retrieve cached data', () => {
    const key = 'test-key';
    const data = { name: 'Test Data' };

    setCache(key, data);
    const cached = getCached(key);

    expect(cached).toEqual(data);
  });

  it('should return null for non-existent key', () => {
    const cached = getCached('non-existent-key');
    expect(cached).toBeNull();
  });

  it('should return null for expired cache', async () => {
    const key = 'test-key';
    const data = { name: 'Test Data' };

    setCache(key, data);

    // Mock time passing (31 seconds)
    jest.useFakeTimers();
    jest.advanceTimersByTime(31000);

    const cached = getCached(key);
    expect(cached).toBeNull();

    jest.useRealTimers();
  });

  it('should clear specific cache key', () => {
    const key1 = 'key1';
    const key2 = 'key2';
    const data1 = { name: 'Data 1' };
    const data2 = { name: 'Data 2' };

    setCache(key1, data1);
    setCache(key2, data2);

    clearCache(key1);

    expect(getCached(key1)).toBeNull();
    expect(getCached(key2)).toEqual(data2);
  });

  it('should clear all cache when no key provided', () => {
    const key1 = 'key1';
    const key2 = 'key2';
    const data1 = { name: 'Data 1' };
    const data2 = { name: 'Data 2' };

    setCache(key1, data1);
    setCache(key2, data2);

    clearCache();

    expect(getCached(key1)).toBeNull();
    expect(getCached(key2)).toBeNull();
  });

  it('should update existing cache', () => {
    const key = 'test-key';
    const data1 = { name: 'Data 1' };
    const data2 = { name: 'Data 2' };

    setCache(key, data1);
    setCache(key, data2);

    const cached = getCached(key);
    expect(cached).toEqual(data2);
  });
});
