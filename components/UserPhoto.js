import React from 'react';
import { generateColor } from '../utils';

const UserPhoto = ({ person, className, size = 50 }) => {
  if (person && person.photo_url) {
    return (
      <img
        alt='user'
        src={person.photo_url}
        className={'rounded-full cmr c-any-user-photo ' + className}
        style={{ height: size, width: size, objectFit: 'cover' }}
      />
    );
  }

  const username = person ? person.username : 'deleted';

  // Unsure why we need a transparent image here, otherwise div gets squished in comments
  return (
    <div className='relative'>
      <img
        alt='placeholder user'
        src='/transparent.png'
        className={'rounded-full absolute ' + className}
        style={{ height: size, width: size, top: 0 }}
      />
      <div
        className={
          'rounded-full z-10 flex items-center justify-center cmr c-any-user-placeholder-photo ' +
          className
        }
        style={{
          backgroundColor: generateColor(username),
          height: size,
          width: size
        }}
      >
        <div
          className='text-white cmr c-any-user-placeholder-photo-text'
          style={{ fontSize: Math.floor(size * 0.6) }}
        >
          {username[0].toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default UserPhoto;
