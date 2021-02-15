import React from 'react';
import Loader from 'react-loader-spinner';
import Link from 'next/link';
import UserPhoto from './UserPhoto';

const ErrorMessage = ({ error = true, className, pill }) => {
  if (!error) return null;
  if (typeof error === 'object') {
    error = error.error;
  }
  if (typeof error === 'string') {
    error = error.replace(/"/g, '');
    if (error.length > 50) {
      error = true;
    }
  }
  if (error === true) {
    error = 'We ran into an error, sorry :( Please try again!';
  }
  return (
    <div
      style={{ maxHeight: 30 }}
      className={
        'py-1 px-3 bg-red-600 text-white text-xs flex items-center justify-center cmr c-error-message ' +
        (pill
          ? 'rounded-full mx-3 '
          : 'mb-3 items-center text-center rounded ') +
        className
      }
    >
      {error}
    </div>
  );
};

export default ErrorMessage;
