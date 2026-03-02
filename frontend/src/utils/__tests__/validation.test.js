import { validateEmail, validatePassword, validateRequired, validateISBN } from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('rejects empty values', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates passwords meeting all criteria', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('Admin@2024')).toBe(true);
      expect(validatePassword('Secure#Pass1')).toBe(true);
    });

    it('rejects passwords without uppercase', () => {
      expect(validatePassword('password123!')).toBe(false);
    });

    it('rejects passwords without lowercase', () => {
      expect(validatePassword('PASSWORD123!')).toBe(false);
    });

    it('rejects passwords without numbers', () => {
      expect(validatePassword('Password!')).toBe(false);
    });

    it('rejects passwords without special characters', () => {
      expect(validatePassword('Password123')).toBe(false);
    });

    it('rejects passwords shorter than 8 characters', () => {
      expect(validatePassword('Pass1!')).toBe(false);
    });

    it('rejects empty passwords', () => {
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('validates non-empty strings', () => {
      expect(validateRequired('text')).toBe(true);
      expect(validateRequired('   text   ')).toBe(true);
    });

    it('rejects empty values', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe('validateISBN', () => {
    it('validates ISBN-10 format', () => {
      expect(validateISBN('0-306-40615-2')).toBe(true);
      expect(validateISBN('0306406152')).toBe(true);
    });

    it('validates ISBN-13 format', () => {
      expect(validateISBN('978-0-306-40615-7')).toBe(true);
      expect(validateISBN('9780306406157')).toBe(true);
    });

    it('rejects invalid ISBN formats', () => {
      expect(validateISBN('123')).toBe(false);
      expect(validateISBN('invalid-isbn')).toBe(false);
      expect(validateISBN('978-123-456')).toBe(false);
    });

    it('rejects empty values', () => {
      expect(validateISBN('')).toBe(false);
      expect(validateISBN(null)).toBe(false);
      expect(validateISBN(undefined)).toBe(false);
    });
  });
});
