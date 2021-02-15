import React from 'react';
import Link from 'next/link';
import UserPhoto from '../UserPhoto';
import { relativeTime } from '../../utils';
import { Bullet } from '../Common';
let cn = require('classnames');
import Linkify from 'react-linkify';
import Microlink from '@microlink/react';
import { Trash2 } from 'react-feather';
import ApiClient from '../../ApiClient';
import ProfileLink from '../ProfileLink';

const componentDecorator = (href, text, key) => {
  if (href.match(/\.(jpeg|jpg|gif|png)$/) != null) {
    return (
      <img
        style={{ maxWidth: '30vw', maxHeight: '30vh' }}
        src={href}
        key={key}
      />
    );
  }

  return <Microlink key={key} url={href} />;
};

const ChatMessage = ({ event, self, prevSender, nextSender, status, last }) => {
  const multipleSend = prevSender === event.sender.id;
  const shouldShowTime = nextSender !== event.sender.id;
  const shouldShowDelete = self && (self.admin || self.id === event.sender.id);
  const shouldShowStatus =
    status === 'Sending' || status === "Couldn't Send" || (last && status);
  const shouldShowUserPhoto = shouldShowTime;

  return (
    <div
      className={cn([
        'chatBox-messageContainer',
        'row',
        { sentFromMe: self && self.id === event.sender.id }
      ])}
    >
      {shouldShowUserPhoto && (
        <Link href={`/profile/[id]`} as={`/profile/${event.sender.id}`}>
          <div className='cursor-pointer'>
            <UserPhoto
              person={event.sender}
              size={40}
              className=' chatBox-userPhoto'
            />
          </div>
        </Link>
      )}
      <div
        className={cn([
          { userPhotoShowing: shouldShowUserPhoto },
          'chatBox-message',
          'col',
          'group'
        ])}
      >
        {!multipleSend && (
          <Link href={`/profile/[id]`} as={`/profile/${event.sender.id}`}>
            <div className='chatBox-messageName cursor-pointer'>
              {event.sender.username}
            </div>
          </Link>
        )}
        <div className={multipleSend ? 'chatBox-multipleSend' : ''}>
          <div className='chatBox-messageContentAndDelete flex flex-row items-center'>
            <div className='chatBox-messageContent'>
              <Linkify componentDecorator={componentDecorator}>
                {event.message}
              </Linkify>
            </div>
            {shouldShowDelete && (
              <div
                className='chat-delete-btn col-c-c'
                onClick={() => ApiClient.delete(`messages/${event.id}`)}
              >
                <Trash2 size={16} />
              </div>
            )}
          </div>

          {shouldShowTime || shouldShowStatus ? (
            <div className='time-status flex flex-row items-center'>
              {shouldShowTime && relativeTime(event.posted)}{' '}
              {shouldShowStatus && shouldShowTime && (
                <Bullet className='mx-1' />
              )}{' '}
              {shouldShowStatus && status}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
