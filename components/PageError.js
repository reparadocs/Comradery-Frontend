import React from 'react';
import Loader from 'react-loader-spinner';
import Link from 'next/link';
import UserPhoto from './UserPhoto';

const PageError = ({ error = true }) => {
  return (
    <div className='flex h-screen w-full items-center justify-center'>
      <div className='text-red-600 py-2 px-4 rounded-full shadow-md bg-white'>
        Sorry, we ran into an error :( Try reloading the page!
      </div>
    </div>
  );
};

export default PageError;
