import React from 'react';
import Loader from 'react-loader-spinner';
import Link from 'next/link';
import UserPhoto from './UserPhoto';

const ChannelLink = ({ channel, style, children, className }) => (
  <Link
    href={{ pathname: `/`, query: { channel: channel.id } }}
    as={`/?channel=${channel.id}`}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className={
        'flex flex-row items-center inline-block hover:underline cursor-pointer cmr c-channel-link ' +
        className
      }
      style={style}
    >
      {children ? children : channel.name}
    </div>
  </Link>
);

export default ChannelLink;
