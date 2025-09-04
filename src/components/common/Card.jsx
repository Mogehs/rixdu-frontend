import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'p-4',
  shadow = 'shadow-md',
  rounded = 'rounded-lg',
  border = '',
  bgColor = 'bg-white',
  ...props
}) => {
  return (
    <div
      className={`
        ${padding}
        ${shadow}
        ${rounded}
        ${border}
        ${bgColor}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
