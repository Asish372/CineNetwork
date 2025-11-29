// src/hooks/use-color-scheme.ts
import { useColorScheme as _useColorScheme } from 'react-native';
/**
 * Simple hook that returns current scheme ('light'|'dark') and color set.
 * Adjust Colors import path depending on whether you use alias "@" or relative imports.
 */

let COLORS_IMPORT = null;

try {
  // If you use module alias @ -> ./src, this will work at runtime
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  COLORS_IMPORT = require('@/constants/theme').Colors;
} catch (e) {
  // fallback to relative import if alias not configured
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  COLORS_IMPORT = require('../constants/theme').Colors;
}

export const useColorScheme = () => {
  const scheme = _useColorScheme(); // returns 'light' | 'dark' | null
  const mode = scheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS_IMPORT && COLORS_IMPORT[mode] ? COLORS_IMPORT[mode] : COLORS_IMPORT || {};
  return { scheme: mode, colors };
};

export default useColorScheme;
