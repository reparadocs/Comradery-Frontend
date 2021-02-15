import React from 'react';
import Nav from './Nav';
import Loader from 'react-loader-spinner';
import Sidebar from './Sidebar';
import Header from './Header';
import Navbar from './Nav';
import MobileBottomNav from './MobileBottomNav';
import useSWR from 'swr';
import ApiClient from '../ApiClient';

const Layout = ({
  children,
  globals,
  refreshData,
  refreshCommunity,
  chatRooms,
  embed,
  selectedTab,
  privateError
}) => {
  useSWR('active_user_check', () => {
    if (globals.self) {
      ApiClient.post(`active_user`, {});
    }
  });
  let unread = chatRooms.filter((room) => room.unread).length > 0;
  if (embed) {
    //embedding
    return (
      <div className='layout__master'>
        <div className='page-cont embed'>{children}</div>
      </div>
    );
  }
  return (
    <div className='layout__master'>
      <div className='row-sb'>
        <div className='desktop-only'>
          <Sidebar
            globals={globals}
            chatRooms={chatRooms}
            refreshCommunity={refreshCommunity}
            privateError={privateError}
          />
        </div>
        {
          <div className='page-cont'>
            <Header
              globals={globals}
              refreshData={refreshData}
            />
            {children}
          </div>
        }
        <div className='desktop-only'>
          <div className='sbr' />
        </div>
      </div>

      <div className='mobile-only'>
        <MobileBottomNav selectedTab={selectedTab} unread={unread} />
      </div>
    </div>
  );
};

export default Layout;
