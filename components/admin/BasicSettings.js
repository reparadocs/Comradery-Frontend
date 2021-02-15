import ErrorMessage from '../ErrorMessage';
import dynamic from 'next/dynamic';
import Loader from 'react-loader-spinner';
import PhotoUpload from '../PhotoUpload';
import XInput from '../XInput';
import XButton from '../XButton';
import AdminRowEditor from './AdminRowEditor';
import Modal from 'react-bootstrap/Modal';
import Reorder, { reorder } from 'react-reorder';
import { Picker } from 'emoji-mart';
import { Label } from '../Common';
import { getHost, isUrl } from '../../utils';
import React, { useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import XTextArea from '../XTextArea';
import { Menu } from 'react-feather';
import ConfirmModal from '../ConfirmModal';
import ProPlanCard from './ProPlanCard';
import Callout from '../Callout';
import Link from 'next/link';

const BasicSettings = ({ community, setCommunity }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [showPrivateConfirm, setShowPrivateConfirm] = useState(false);

  const onChangeList = (obj, idx, key) => {
    var list = [...community[key]];
    if (obj === null) {
      list.splice(idx, 1);
    } else {
      list[idx] = obj;
    }
    setCommunity({ ...community, [key]: list });
  };

  let invite_link = null;

  if (typeof window !== 'undefined') {
    invite_link = `${window.location.hostname}?invite_code=${community.invite_code}`;
  }

  return (
    <div className='admin-inner col'>
      <div className='w-full'>
        {typeof window !== 'undefined' && (
          <Callout title='Invite Users to Your Community!' className='my-4'>
            {community.private ? (
              <div className='flex flex-row'>
                Invite others with this link (click to copy):&nbsp;
                {copied && (
                  <span className='text-green-500'>Copied!&nbsp;</span>
                )}
                <CopyToClipboard
                  text={invite_link}
                  onCopy={() => setCopied(true)}
                >
                  <div className='cursor-pointer text-blue-500 font-bold hover:text-blue-700'>
                    {invite_link}
                  </div>
                </CopyToClipboard>
              </div>
            ) : (
              <div>
                Your community is currently public so anyone visiting
                <b>&nbsp;{getHost()}&nbsp;</b> can view public posts/chats and
                create an account!
              </div>
            )}
            <div>
              Or{' '}
              <a
                href='/admin?page=3'
                className='underline text-blue-500 font-bold hover:text-blue-700'
              >
                send them an email invite!
              </a>
            </div>
          </Callout>
        )}
        <Label className='large' marginTop={true}>
          {community.private ? 'Private ' : 'Public '} Community
        </Label>
        <div className='group'>
          <XButton
            className='mx-auto'
            onClick={() => setShowPrivateConfirm(true)}
          >
            Make Community {community.private ? 'Public' : 'Private'}
          </XButton>
        </div>
      </div>

      <Label className='large' marginTop={true}>
        External Links
      </Label>
      <div className='group'>
        <div className='mb-4'>
          {community.links.map((link, idx) => (
            <div className='flex flex-row  mb-3' key={idx}>
              <XInput
                containerClassName='w-full'
                value={link.label || ''}
                placeholder='Title'
                onChange={(e) => {
                  link.label = e.target.value;
                  onChangeList(link, idx, 'links');
                }}
              />

              <XInput
                containerClassName='w-full'
                value={link.url || ''}
                className='ml-2'
                placeholder='URL'
                onChange={(e) => {
                  link.url = e.target.value;
                  onChangeList(link, idx, 'links');
                }}
              />

              <XButton
                variant='warning'
                className='mt-2 ml-4'
                style={{ paddingLeft: '0.5em', paddingRight: '0.5em' }}
                onClick={() => onChangeList(null, idx, 'links')}
              >
                Delete
              </XButton>
            </div>
          ))}
          <div
            onClick={() => {
              const links = [...community.links, { label: '', url: '' }];
              setCommunity({ ...community, links });
            }}
            className='border mt-5 cursor-pointer border-gray-500 hover:bg-gray-300 rounded flex justify-center font-bold py-2 w-40 px-4 h-10 '
          >
            + Add Link
          </div>
        </div>
      </div>
      <Label className='large' marginTop={true}>
        Chat Rooms
      </Label>
      <div className='group'>
        <div className='mb-4'>
          {community.chatrooms.map((room, idx) => (
            <div className='flex flex-row  mb-3' key={idx}>
              <AdminRowEditor
                modalTitle={`Delete Chatroom ${room.name}?`}
                modalContent={`If you delete this chatroom, all messages will be permanently deleted. This is not reversable. Are you sure you want to delete chatroom ${room.name}?`}
                onChange={(room) => onChangeList(room, idx, 'chatrooms')}
              >
                <XInput
                  containerClassName='w-full'
                  value={room.name || ''}
                  placeholder='Name'
                  onChange={(e) => {
                    room.name = e.target.value;
                    onChangeList(room, idx, 'chatrooms');
                  }}
                />
              </AdminRowEditor>
            </div>
          ))}
          <div
            onClick={() => {
              const chatrooms = [...community.chatrooms, { name: '' }];
              setCommunity({ ...community, chatrooms });
            }}
            className='border mt-5 cursor-pointer border-gray-500 hover:bg-gray-300 rounded flex justify-center font-bold py-2 w-40 px-4 h-10 '
          >
            + Add Room
          </div>
        </div>
      </div>
      <Label className='large' marginTop={true}>
        Custom Profile Fields
      </Label>
      <div className='group'>
        {community.free ? (
          <ProPlanCard />
        ) : (
          <div className='mb-4'>
            <Reorder
              holdTime={100}
              reorderId='field-list'
              onReorder={(event, pIdx, nIdx, fromId, toId) =>
                setCommunity({
                  ...community,
                  custom_fields: reorder(community.custom_fields, pIdx, nIdx)
                })
              }
            >
              {community.custom_fields.map((field, idx) => (
                <div
                  className='bg-gray-300 items-center flex flex-row p-4 rounded mb-2'
                  key={idx}
                >
                  <AdminRowEditor
                    modalTitle={`Delete Field ${field.name}?`}
                    modalContent={`If you delete this field, all user info related to this field will also be delted. This change is irreversable. Are you sure you want to delete the field ${field.name}?`}
                    onChange={(field) =>
                      onChangeList(field, idx, 'custom_fields')
                    }
                  >
                    <Menu className='text-gray-500 mt-2 mr-3 cursor-pointer' />
                    <XInput
                      containerClassName='w-full'
                      value={field.name || ''}
                      placeholder='Name'
                      onChange={(e) => {
                        field.name = e.target.value;
                        onChangeList(field, idx, 'custom_fields');
                      }}
                    />
                  </AdminRowEditor>
                </div>
              ))}
            </Reorder>

            <div
              onClick={() => {
                const custom_fields = [
                  ...community.custom_fields,
                  { name: '' }
                ];
                setCommunity({ ...community, custom_fields });
              }}
              className='border mt-5 cursor-pointer border-gray-500 hover:bg-gray-300 rounded flex justify-center font-bold py-2 w-40 px-4 h-10 '
            >
              + Add Field
            </div>
          </div>
        )}
      </div>
      <Label className='large' marginTop={true}>
        Discussion Channels
      </Label>

      <div className='group'>
        <Reorder
          holdTime={100}
          reorderId='channel-list'
          onReorder={(event, pIdx, nIdx, fromId, toId) =>
            setCommunity({
              ...community,
              channels: reorder(community.channels, pIdx, nIdx)
            })
          }
        >
          {community.channels.map((channel, idx) => (
            <div className='bg-gray-300 p-4 rounded mb-2' key={idx}>
              <AdminRowEditor
                modalTitle={`Delete Channel ${channel.name}?`}
                modalContent={`If you delete this channel, all associated posts will still be available under "All Posts", but will have no channel associated with them. This is not reversable. Are you sure you want to delete channel ${channel.name}?`}
                onChange={(channel) => onChangeList(channel, idx, 'channels')}
              >
                <Menu className='text-gray-500 mt-2 mr-3 cursor-pointer' />

                <div
                  className='text-xl cursor-pointer hover:bg-gray-500 border-gray-500 border rounded  mt-2'
                  style={{
                    minHeight: 40,
                    minWidth: 40,
                    paddingLeft: 9,
                    paddingTop: 6
                  }}
                  onClick={() => {
                    setShowEmojiPicker(true);
                    setCurrentChannelIndex(idx);
                  }}
                >
                  {channel.emoji}
                </div>
                <XInput
                  containerClassName='w-full ml-6'
                  value={channel.name}
                  onChange={(e) => {
                    channel.name = e.target.value;
                    onChangeList(channel, idx, 'channels');
                  }}
                />
              </AdminRowEditor>
            </div>
          ))}
        </Reorder>
        <div
          onClick={() => {
            const channels = [...community.channels, { name: '', emoji: '😊' }];
            setCommunity({ ...community, channels });
          }}
          className='border mt-5 cursor-pointer border-gray-500 hover:bg-gray-300 rounded flex justify-center font-bold py-2 w-40 px-4 h-10 '
        >
          + Add Channel
        </div>
        <ConfirmModal
          show={showPrivateConfirm}
          onHide={() => setShowPrivateConfirm(false)}
          title={'Change Community Privacy'}
          path={`community/${getHost()}/privacy`}
          postData={{ private: !community.private }}
          onSuccess={(data) => {
            setCommunity({ ...community, private: data.private });
          }}
        >
          Are you sure you want to make your community{' '}
          {community.private
            ? 'public? Anyone visiting your community will be able to see public posts and chats and can create an account.'
            : 'private? Only those with an already created account or people who you invite will be able to see this community.'}
        </ConfirmModal>
        <Modal
          dialogClassName='w-fit-content'
          show={showEmojiPicker}
          onHide={() => setShowEmojiPicker(false)}
        >
          <Modal.Body>
            <Picker
              title='Select Emoji!'
              darkMode={false}
              emoji=''
              onSelect={(emoji) => {
                var channel = community.channels[currentChannelIndex];
                channel.emoji = emoji.native;
                onChangeList(channel, currentChannelIndex, 'channels');
                setShowEmojiPicker(false);
              }}
            />
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default BasicSettings;
