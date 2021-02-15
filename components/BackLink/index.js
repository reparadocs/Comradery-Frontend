import React from 'react';
import Loader from 'react-loader-spinner';
import Link from 'next/link';
import UserPhoto from '../UserPhoto';
import { ArrowLeft } from 'react-feather';
import { useRouter } from 'next/router';

const BackLink = ({ href, as, label, globals }) => {
  const router = useRouter();
  return (
    <div className='desktop-only'>
      <div
        onClick={() => {
          globals.track('Back Link Clicked', { link: href, label: label });
          if (globals.canGoBack()) {
            router.back();
          } else {
            globals.historyReplace(href, as);
          }
        }}
        className='backLink row-fs-c cmr c-back-link'
        style={{ width: 'fit-content' }}
      >
        <ArrowLeft size={18} />
        &nbsp;Back to {label}
      </div>
    </div>
  );
};

export default BackLink;
