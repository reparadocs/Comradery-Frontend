import React, { useState } from 'react';
import '../../style.css';
import UserPhoto from '../UserPhoto';
import Link from 'next/link';
import { setCookie, destroyCookie } from 'nookies';
import { getSubdomain } from '../../utils';
import ApiClient from '../../ApiClient.js';
import EditProfileLink from '../EditProfileLink';
import {
  Settings,
  Edit3,
  LogOut,
  Bell,
  User,
  Search,
  ChevronDown
} from 'react-feather';

const AccountDropdown = ({ globals, refreshData }) => {
  const [open, setOpen] = useState(false);
  const person = globals.self;

  const optionClassName = 'row-sb-c cmr c-account-dropdown-row dropMenu-row';

  return (
    <div
      className='accountDropdown relative outline-none ml-auto cmr c-account-dropdown-container'
      onBlur={() =>
        setTimeout(() => {
          if (open) {
            setOpen(false);
          }
        }, 200)
      }
      tabIndex={0}
    >
      <div
        onClick={() => {
          globals.track('Account Dropdown Clicked', { open: !open });

          setOpen((open) => !open);
        }}
        className='accountDropdown-displayArea cmr c-account-dropdown'
      >
        <UserPhoto person={person} size={36} />
      </div>

      {open && (
        <div className='dropMenu cmr c-account-dropdown-menu-1'>
          <div className='dropMenu-name col-c'>{person.username}</div>
          <div
            className='cmr c-account-dropdown-menu-1'
            onClick={() => setOpen(false)}
          >
            {person.admin && (
              <Link href='/admin'>
                <div
                  onClick={() =>
                    globals.track('Dropdown - Admin Panel Clicked', {})
                  }
                  className={optionClassName}
                >
                  <div className='row-fs-c'>
                    <div>
                      <Settings size={16} />
                    </div>
                    <span>Admin Panel</span>
                  </div>
                  <img src='/arrow.svg' alt='arrow' />
                </div>
              </Link>
            )}
            <Link href='/profile/[id]' as={`/profile/${person.id}`}>
              <div
                onClick={() =>
                  globals.track('Dropdown - View Profile Clicked', {})
                }
                className={optionClassName}
              >
                <div className='row-fs-c'>
                  <div>
                    <User size={16} />
                  </div>
                  <span>View Profile</span>
                </div>
                <img src='/arrow.svg' alt='arrow' />
              </div>
            </Link>
            <EditProfileLink profile={person}>
              <div
                onClick={() =>
                  globals.track('Dropdown - Edit Profile Clicked', {})
                }
                className={optionClassName}
              >
                <div className='row-fs-c'>
                  <div>
                    <Edit3 size={16} />
                  </div>
                  <span>Edit Profile</span>
                </div>
                <img src='/arrow.svg' alt='arrow' />
              </div>
            </EditProfileLink>
            <Link href='/notification_settings'>
              <div
                onClick={() =>
                  globals.track('Dropdown - Notification Settings Clicked', {})
                }
                className={optionClassName}
              >
                <div className='row-fs-c'>
                  <div>
                    <Bell size={16} />
                  </div>
                  <span>Notification Settings</span>
                </div>
                <img src='/arrow.svg' alt='arrow' />
              </div>
            </Link>

            <div
              className={optionClassName}
              onClick={() => {
                globals.track('Dropdown - Logout Clicked', {});
                ApiClient.post('logout', {});
                destroyCookie(null, getSubdomain(), { path: '/' });
                if (
                  globals.community &&
                  globals.community.logout_redirect &&
                  typeof window !== 'undefined'
                ) {
                  window.location.href = globals.community.logout_redirect;
                }
                refreshData({ clear: true });
              }}
            >
              <div className='row-fs-c'>
                <div>
                  <LogOut size={16} />
                </div>
                <span>Logout</span>
              </div>
              <img src='/arrow.svg' alt='arrow' />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;
