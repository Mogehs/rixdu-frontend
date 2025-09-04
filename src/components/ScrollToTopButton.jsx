import React from 'react';
import useScrollToTop from '../hooks/useScrollToTop';

const ScrollToTopButton = ({ className = '', children }) => {
  const scrollToTop = useScrollToTop();

  return (
    <button
      className={`scroll-to-top-button ${className}`}
      onClick={scrollToTop}
      aria-label='Scroll to top'
    >
      {children || 'Back to Top'}
    </button>
  );
};

export default ScrollToTopButton;
