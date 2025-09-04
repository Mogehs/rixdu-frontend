import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = (options = { behavior: 'smooth' }) => {
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: options.behavior,
    });
  }, [options.behavior]);

  return scrollToTop;
};

export const ScrollToTop = ({ behavior = 'auto' } = {}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior,
    });
  }, [pathname, behavior]);

  return null;
};

export default useScrollToTop;
