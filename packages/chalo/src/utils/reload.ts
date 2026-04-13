/**
 * Utilities for detecting page reloads and navigation type
 */

/**
 * Detects if the current page load is a reload (vs initial navigation or back/forward)
 * Uses the Navigation Timing API for modern browsers with fallback to deprecated API
 */
export function isPageReload(): boolean {
  // Modern browsers: Performance Navigation Timing API (Navigation Timing Level 2)
  const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  
  if (navEntries.length > 0) {
    return navEntries[0].type === 'reload';
  }
  
  // Fallback for older browsers (deprecated but widely supported)
  const perf = performance as any;
  if (perf.navigation && typeof perf.navigation.type === 'number') {
    return perf.navigation.type === 1; // 1 = TYPE_RELOAD
  }
  
  // If we can't determine, assume it's not a reload (safer default)
  return false;
}

/**
 * Gets the navigation type as a descriptive string
 */
export function getNavigationType(): 'navigate' | 'reload' | 'back_forward' | 'unknown' {
  const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  
  if (navEntries.length > 0) {
    return navEntries[0].type;
  }
  
  const perf = performance as any;
  if (perf.navigation && typeof perf.navigation.type === 'number') {
    const type = perf.navigation.type;
    switch (type) {
      case 0: return 'navigate';
      case 1: return 'reload';
      case 2: return 'back_forward';
      default: return 'unknown';
    }
  }
  
  return 'unknown';
}
