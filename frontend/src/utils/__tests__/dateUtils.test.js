import { formatDate, isOverdue, calculateDaysRemaining, addDays } from '../dateUtils';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDate(date)).toBe('1/15/2024');
    });

    it('handles ISO string input', () => {
      const isoString = '2024-12-25T00:00:00Z';
      expect(formatDate(isoString)).toMatch(/12\/25\/2024/);
    });

    it('handles null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('isOverdue', () => {
    it('returns true for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isOverdue(pastDate)).toBe(true);
    });

    it('returns false for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isOverdue(futureDate)).toBe(false);
    });

    it('returns false for today', () => {
      const today = new Date();
      expect(isOverdue(today)).toBe(false);
    });

    it('handles ISO string input', () => {
      const pastIsoString = '2020-01-01T00:00:00Z';
      expect(isOverdue(pastIsoString)).toBe(true);
    });
  });

  describe('calculateDaysRemaining', () => {
    it('calculates positive days correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(calculateDaysRemaining(futureDate)).toBe(5);
    });

    it('calculates negative days for overdue', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      expect(calculateDaysRemaining(pastDate)).toBe(-3);
    });

    it('returns 0 for today', () => {
      const today = new Date();
      const result = calculateDaysRemaining(today);
      expect(result).toBe(0);
    });
  });

  describe('addDays', () => {
    it('adds days correctly', () => {
      const date = new Date('2024-01-01');
      const result = addDays(date, 10);
      expect(result.getDate()).toBe(11);
    });

    it('subtracts days with negative input', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    it('handles month transitions', () => {
      const date = new Date('2024-01-31');
      const result = addDays(date, 1);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(1);
    });
  });
});
