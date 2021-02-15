import React, { useState } from 'react';
import { ChevronDown, Menu } from 'react-feather';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProfileLink from '../ProfileLink';
import Loader from 'react-loader-spinner';
import Notifications from '../notifications/Notifications';
import UserPhoto from '../UserPhoto';
import AccountDropdown from '../AccountDropdown';
import CommunityLogo from '../CommunityLogo';
let cn = require('classnames');

const Nav = ({ globals, refreshData, className }) => {
  return (
    <div className={className}>
      <div>
        {globals.self ? (
          <div className='flex flex-row items-center'>
            <div className='block mr-2'>
              <Notifications mobile={true} />
            </div>
            <AccountDropdown globals={globals} refreshData={refreshData} />
          </div>
        ) : (
          <div className='flex relative items-baseline ml-auto cmr c-nav-auth'>
            <div>
              <a
                onClick={() => globals.authRequired(false, true)}
                href='#'
                className='px-3 py-2 font-medium text-center text-sm rounded-lg bg-gray-300 text-gray-900 hover:bg-gray-400 focus:outline-none focus:bg-gray-400 hover:no-underline hover:text-gray-900 cmr c-nav-login'
              >
                Login
              </a>
            </div>
            <div className='hidden md:block'>
              <a
                onClick={() => globals.authRequired(false, false)}
                href='#'
                className='ml-4 px-3 py-2 font-medium text-center text-sm rounded-lg bg-gray-300 text-gray-900 hover:bg-gray-400 focus:outline-none focus:bg-gray-400 hover:no-underline hover:text-gray-900 cmr c-nav-create-account'
              >
                Create Account
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nav;
