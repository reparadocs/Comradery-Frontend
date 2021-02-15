import React from 'react';
import Loader from 'react-loader-spinner';
import Link from 'next/link';
import UserPhoto from './UserPhoto';

const ProfileLink = ({ profile, style, className, track }) => {
  if (!profile) {
    return (
      <div
        className={
          'flex flex-row items-center inline-block cmr c-profile-link-deleted ' +
          className
        }
      >
        [deleted]
      </div>
    );
  }
  return (
    <Link href={`/profile/[id]`} as={`/profile/${profile.id}`}>
      <div
        onClick={(e) => {
          if (track) {
            track('Profile Link Clicked', {
              username: profile.username,
              id: profile.id
            });
          }

          e.stopPropagation();
        }}
        className={
          'flex flex-row items-center inline-block cursor-pointer cmr c-profile-link ' +
          className
        }
        style={style}
      >
        {profile.username}
      </div>
    </Link>
  );
};

export default ProfileLink;
