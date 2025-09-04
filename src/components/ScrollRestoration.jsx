import React from 'react';
import { ScrollToTop } from '../hooks/useScrollToTop';

const ScrollRestoration = ({ behavior = 'auto' }) => {
  return <ScrollToTop behavior={behavior} />;
};

export default ScrollRestoration;
