import { clearMovieCache } from '../services/requestCache';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  clearMovieCache();
  vi.unstubAllGlobals();
});
