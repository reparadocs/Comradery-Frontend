import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  SidebarSection,
  SidebarRow,
  ChatIcon,
  ChatOnlineIndicator,
  ChatUnreadsOrOnlineCount,
  SidebarSVGIcon,
  SectionItem
} from './components';
import Link from 'next/link';
import { chatRoomNamePerson } from '../../utils';
import CommunityLogo from '../CommunityLogo';
import AllPosts from '../icons/AllPosts';
import Search from '../icons/Search';
import { ExternalLink, Settings, Lock } from 'react-feather';
import Notifications from '../notifications/Notifications';
import SettingsModal from '../SettingsModal';
import Private from '../icons/Private';

let cn = require('classnames');

export default ({ globals, chatRooms, refreshCommunity, privateError }) => {
  const router = useRouter();

  const setChannel = (_channel) => {
    let href = '/';
    if (_channel >= 0) {
      let channelID = globals.community.channels[_channel].id;

      href = '/?channel=' + channelID;
    }

    if (router.asPath !== href) {
      router.push(href, href, { shallow: true });
    }
  };

  let urlParams = {};
  let path = '';
  if (typeof window !== 'undefined') {
    urlParams = new URLSearchParams(window.location.search);
    path = window.location.pathname;
  }

  if (privateError) return null;

  return (
    <div className='sb'>
      <section className='sb--logo row-fs-c'>
        <CommunityLogo community={globals.community} track={globals.track} />
      </section>
      <div className='sb--scrollArea'>
        <button
          style={{ outline: 'none' }}
          className='sb--btn col-c-c cmr c-new-post-button'
          onClick={() => {
            globals.track('Home - New Post Clicked', {});
            if (globals.authRequired()) {
              router.push('/new_post');
            }
          }}
        >
          New Post
        </button>
        <SidebarSection>
          <SectionItem
            active={path === '/directory'}
            onClick={() => {
              globals.track('Home - Directory Clicked', {});
              router.push(`/directory`);
            }}
            icon={<div>👥‍</div>}
          >
            <span className='row-fs-c'>Directory</span>
          </SectionItem>

          {globals.community &&
            globals.community.links.map((link, idx) => (
              <SectionItem
                icon={<ExternalLink size={16} />}
                onClick={() => {
                  globals.track('Home - Link Clicked', {
                    url: link.url,
                    label: link.label
                  });
                  if (typeof window !== 'undefined') {
                    window.open(link.url, '_blank');
                  }
                }}
                key={idx}
                className='flex w-full items-center px-4 py-2 border-b-2 last:border-b-0 cmr c-any-link'
              >
                <span className='row-fs-c'>{link.label}</span>
              </SectionItem>
            ))}
        </SidebarSection>

        <SidebarSection
          label={
            <label className='sb--sectionLabel row-sb-c'>
              <span>Discussions </span>
              {globals.self && globals.self.admin && (
                <SettingsModal
                  refreshCommunity={refreshCommunity}
                  create
                  searchClient={globals.searchClient}
                />
              )}
            </label>
          }
          maxVH={40} // what percent of the viewport height to allow before cutting off
        >
          <SectionItem
            active={path === '/' && !urlParams.has('channel')}
            onClick={() => {
              globals.track('Home - All Posts Clicked', {});
              setChannel(-1);
            }}
            icon={<div>🗄️</div>}
          >
            <span className='row-fs-c'>All Posts</span>
          </SectionItem>
          {globals.community &&
            globals.community.channels.map((channel, idx) => (
              <SectionItem
                active={
                  path === '/' &&
                  urlParams.has('channel') &&
                  parseInt(urlParams.get('channel')) === channel.id
                }
                icon={
                  <div>
                    {channel.private ? (
                      <Private containerSize={18} size={10} />
                    ) : (
                      channel.emoji
                    )}
                  </div>
                }
                key={idx}
                onClick={() => {
                  globals.track('Channel Clicked', {
                    channel: channel.name
                  });
                  setChannel(idx);
                }}
              >
                <div className='row-sb-c w-full'>
                  <span className='row-fs-c'>{channel.name}</span>
                  {globals.self && globals.self.admin && (
                    <div className='sb--settings'>
                      <SettingsModal
                        refreshCommunity={refreshCommunity}
                        channelID={channel.id}
                        searchClient={globals.searchClient}
                      />
                    </div>
                  )}
                </div>
              </SectionItem>
            ))}
        </SidebarSection>
        <SidebarSection
          label={<label className='sb--sectionLabel row-fs-c'>Chats</label>}
        >
          {chatRooms.map((room, idx) => {
            const [roomName, roomPerson] = chatRoomNamePerson(
              room,
              globals.self
            );
            return roomName ? (
              <SectionItem
                key={idx}
                active={
                  path === '/chat' &&
                  urlParams.has('room') &&
                  parseInt(urlParams.get('room')) === room.id
                }
                icon={<ChatIcon person={roomPerson} />}
                onClick={() => {
                  globals.track('Chat Clicked', { channel: room.id });
                  router.push(`/chat?room=${room.id}`);
                }}
              >
                <div className='row-sb-c w-full'>
                  <span className='row-fs-c'>{roomName}</span>
                  <div className='ml-auto'>
                    <ChatUnreadsOrOnlineCount
                      unread={room.unread}
                      selected={
                        path === '/chat' &&
                        urlParams.has('room') &&
                        parseInt(urlParams.get('room')) === room.id
                      }
                    />
                  </div>
                </div>
              </SectionItem>
            ) : null;
          })}
        </SidebarSection>
      </div>
    </div>
  );
};
