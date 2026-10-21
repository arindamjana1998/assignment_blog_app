import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { createSlug, generateUniqueSlug } from '../../../src/utils/slugger.js';

describe('Slugger Utility Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSlug', () => {
    test('should generate clean URL friendly slug', () => {
      const slug = createSlug('Building Scalable Web Apps in 2026!');
      expect(slug).toBe('building-scalable-web-apps-in-2026');
    });

    test('should strip special characters and lowercase words', () => {
      const slug = createSlug('Special *+~.()!:@ characters');
      expect(slug).toBe('special-characters');
    });

    test('should handle empty or whitespace string', () => {
      const slug = createSlug('   ');
      expect(slug).toBe('');
    });
  });

  describe('generateUniqueSlug', () => {
    test('should return base slug if not already taken', async () => {
      const mockModel = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const slug = await generateUniqueSlug(mockModel, 'My Brand New Post');
      expect(slug).toBe('my-brand-new-post');
      expect(mockModel.findOne).toHaveBeenCalledWith({ slug: 'my-brand-new-post' });
    });

    test('should append random suffix if base slug already exists', async () => {
      const mockModel = {
        // First call finds existing collision; second call finds free slug
        findOne: jest
          .fn()
          .mockResolvedValueOnce({ _id: 'collision123', slug: 'existing-post' })
          .mockResolvedValueOnce(null),
      };

      const slug = await generateUniqueSlug(mockModel, 'Existing Post');
      expect(slug).toMatch(/^existing-post-[a-f0-9]{6}$/);
      expect(mockModel.findOne).toHaveBeenCalledTimes(2);
    });
  });
});
