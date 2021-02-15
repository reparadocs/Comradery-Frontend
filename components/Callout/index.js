import React from 'react';

const Callout = ({ title, children, className }) => {
  return (
    <div
      className={
        'calloutBox border-2 border-blue-700 bg-blue-100 py-2 px-4 cmr c-callout-container ' +
        className
      }
    >
      <div className='font-bold text-blue-700 cmr c-callout-title'>{title}</div>
      <div className='text-blue-700 cmr c-callout-content'>{children}</div>
    </div>
  );
};

export default Callout;
