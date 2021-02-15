import React, { useState, useEffect } from 'react';
import ApiClient, { initialPropsHelper } from '../ApiClient.js';
import { PageHeader, BackButton } from '../components/Common';
import { getHost, isUrl, chatRoomNamePerson, relativeTime } from '../utils';
import XInput from '../components/XInput';
import ErrorMessage from '../components/ErrorMessage';
import XButton from '../components/XButton';
import dynamic from 'next/dynamic';
import Modal from 'react-bootstrap/Modal';
import Loader from 'react-loader-spinner';
import { useRouter } from 'next/router';
import PhotoUpload from '../components/PhotoUpload';
import XTextArea from '../components/XTextArea';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ChatBox from '../components/ChatBox';
import PageLoading from '../components/PageLoading.js';
import UserPhoto from '../components/UserPhoto';
import Nav from '../components/Nav';
let cn = require('classnames');

function Chat({ globals, socket, _community, refreshData }) {
  const router = useRouter();
  const { room } = router.query;

  useEffect(() => {
    globals.setTab('chat');
  }, []);

  if (!room && !globals.chatRooms) return <PageLoading />;

  return (
    <div>
      {room ? (
        <ChatBox
          globals={globals}
          refreshData={refreshData}
          socket={socket}
          room={room}
        />
      ) : (
        <div>
          <PageHeader title='Chat' />
          <div className='pHead feedNav row-sb-c'>
            <h1>Chat</h1>
            <Nav
              globals={globals}
              refreshData={refreshData}
              className='ml-auto pHead--nav'
            ></Nav>
          </div>
          {globals.chatRooms.map((chatroom, idx) => {
            const [roomName, roomPerson] = chatRoomNamePerson(
              chatroom,
              globals.self
            );
            return (
              <div
                key={idx}
                className={cn([
                  'chatCard',
                  'row-fs-c',
                  {
                    hasUnread: chatroom.unread
                  }
                ])}
                onClick={() => {
                  globals.track('Chat Clicked', { channel: chatroom.id });
                  router.push(`/chat?room=${chatroom.id}`);
                }}
              >
                <div className='img col-c-c' alt='user'>
                  {roomPerson ? <UserPhoto person={roomPerson} /> : '#'}
                </div>
                <div className='txt col'>
                  <div className='row-sb-c'>
                    <div className='name'>{roomName}</div>
                  </div>
                  <div
                    className={chatroom.unread ? 'font-bold' : 'text-gray-500'}
                  >
                    {chatroom.last_message && chatroom.last_message.message}
                  </div>
                </div>
                <div className='flex flex-row justify-center items-center'>
                  <span className='time'>
                    {chatroom.last_message &&
                      relativeTime(chatroom.last_message.posted)}
                  </span>
                  <div className='unreadIcon' />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Chat;
