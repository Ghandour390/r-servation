import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'active', false && 'inactive')).toBe('base active');
    });

    it('should override conflicting Tailwind classes', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
    });
  });
});
