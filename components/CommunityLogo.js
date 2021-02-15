import React from 'react';
import Loader from 'react-loader-spinner';
import Link from 'next/link';
import UserPhoto from './UserPhoto';

const CommunityLogo = ({ community, onClick, track }) => {
  return (
    <Link href='/'>
      <div
        onClick={() => {
          track('Logo Clicked', {});
          if (onClick) {
            onClick();
          }
        }}
        style={
          community && community.photo ? { height: '100%', width: 200 } : {}
        }
        className='cursor-pointer cmr c-community-logo flex items-center'
      >
        {community && community.photo ? (
          <img
            alt='community logo'
            style={{ height: '100%', objectFit: 'cover' }}
            src={community.photo}
          />
        ) : (
          community && community.display_name
        )}
      </div>
    </Link>
  );
};

export default CommunityLogo;
