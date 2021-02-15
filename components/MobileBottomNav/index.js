import React from 'react';
import Link from 'next/link';
import { Home, MessageCircle, Search, Users } from 'react-feather';
import Nav from '../Nav';

const NavSection = ({ name, icon, link, active }) => (
  <Link href={link}>
    <div
      className={
        (active ? 'text-blue-500' : '') +
        ' items-center flex flex-col justify-center cursor-pointer'
      }
    >
      {icon}
    </div>
  </Link>
);
const MobileBottomNav = ({ selectedTab, unread }) => {
  return (
    <div className='flex flex-row justify-around bg-white w-full mobile-bottom-nav'>
      <NavSection
        link='/'
        name='Posts'
        icon={<Home />}
        active={selectedTab === 'posts'}
      />
      <NavSection
        link='/search'
        name='Search'
        icon={<Search />}
        active={selectedTab === 'search'}
      />
      <NavSection
        link='/chat'
        name='Chat'
        icon={
          unread ? (
            <div className='relative'>
              <MessageCircle />
              <div className='mobileBottom-unreadBubble' />
            </div>
          ) : (
            <MessageCircle />
          )
        }
        active={selectedTab === 'chat'}
      />
      <NavSection
        link='/directory'
        name='Directory'
        icon={<Users />}
        active={selectedTab === 'people'}
      />
    </div>
  );
};

export default MobileBottomNav;
