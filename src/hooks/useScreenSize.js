import { useState, useEffect } from 'react';

/**
 * Hook to detect current screen size and breakpoints
 * @returns {Object} Screen size information and boolean flags for breakpoints
 */
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 640,
    isTablet: window.innerWidth >= 640 && window.innerWidth < 768,
    isDesktop: window.innerWidth >= 768 && window.innerWidth < 1024,
    isLargeDesktop: window.innerWidth >= 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({
        width,
        height,
        isMobile: width < 640, // sm
        isTablet: width >= 640 && width < 768, // md
        isDesktop: width >= 768 && width < 1024, // lg
        isLargeDesktop: width >= 1024, // xl
      });
    };

    window.addEventListener('resize', handleResize);

    // Initial call
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

export default useScreenSize;
