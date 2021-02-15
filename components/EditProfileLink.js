import React from 'react';
import Link from 'next/link';

const EditProfileLink = ({ profile, children }) => {
  if (profile.edit_profile_redirect) {
    return <a href={profile.edit_profile_redirect}>{children}</a>;
  }
  return (
    <Link href='/edit_profile/[id]' as={`/edit_profile/${profile.id}`}>
      {children}
    </Link>
  );
};

export default EditProfileLink;
