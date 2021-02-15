import React, { useEffect, useRef, useState } from 'react';
import Loader from 'react-loader-spinner';
import Link from 'next/link';
import UserPhoto from '../UserPhoto';
import SockJS from 'sockjs-client';
import XButton from '../XButton';
import XInput from '../XInput';
import ApiClient from '../../ApiClient';
import { PageHeader, TitleComponent } from '../Common';
import uuidv4 from 'uuid/v4';
import {
  isProduction,
  getHost,
  getSubdomain,
  analyticsPage,
  getSegmentUserId,
  analyticsIdentify,
  analyticsTrack,
  chatRoomNamePerson
} from '../../utils';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import ChatMessage from './ChatMessage';
import { BackButton } from '../Common';
import { Send, Delete, XCircle } from 'react-feather';
import moment from 'moment';
import InfiniteScroll from '../InfiniteScroll';
import Nav from '../Nav';
import { Image } from 'react-feather';

const ChatBox = ({ globals, refreshData, socket, room }) => {
  const roomID = useRef(-1);
  const [roomName, setRoomName] = useState('');
  const sentMessageIds = useRef([]);
  const [messageStatuses, setMessageStatuses] = useState({});
  const initialLoad = useRef(true);
  const [chatRoom, setChatRoom] = useState(null);
  const [message, setMessage] = useState('');
  const [events, setEvents] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const initializePage = (roomName, callback = null) => {
    globals.setMessageCallback(callback);
  };

  const refreshMessages = (room) => {
    setHasNext(false);
    ApiClient.get(`chatrooms/${room}/messages`, {
      onSuccess: (data) => {
        let messages = data.data.reverse();
        setHasNext(data.has_next);
        setEvents(messages);
        scrollToBottom(false);
        if (globals.self && messages.length) {
          ApiClient.post(`chatrooms/${room}/read`, {
            read: messages[messages.length - 1].id
          });
        }
        globals.onRead(room);
      }
    });
  };

  useEffect(() => {
    initializePage(null);
    let queryRoom = parseInt(room);
    if (queryRoom !== roomID.current) {
      roomID.current = queryRoom;
      ApiClient.get(`chatrooms/${queryRoom}`, {
        onSuccess: (data) => {
          setChatRoom(data);
          const [rName, rPerson] = chatRoomNamePerson(data, globals.self);
          setRoomName(rName);
          initializePage(rName, (eventData) => {
            if (eventData.room === roomID.current) {
              if (eventData.delete) {
                setEvents((events) => {
                  let idx = events.findIndex((e) => e.id === eventData.delete);
                  if (idx >= 0) {
                    let nEvents = [...events];
                    nEvents[idx].message = '[deleted]';
                    return nEvents;
                  }
                  return events;
                });
              } else {
                if (
                  !globals.self ||
                  eventData.sender.id !== globals.self.id ||
                  !sentMessageIds.current.includes(eventData.sa_id)
                ) {
                  setEvents((events) => [...events, eventData]);
                }
                scrollToBottom();

                if (globals.self) {
                  ApiClient.post(`chatrooms/${eventData.room}/read`, {
                    read: eventData.id
                  });
                }
              }

              return true;
            }
            return false;
          });
        }
      });

      refreshMessages(queryRoom);
    }
  }, [room]);

  const onSubmit = () => {
    if (globals.authRequired()) {
      let msg = message;
      if (attachedPhoto) {
        msg += ' ' + attachedPhoto;
      }
      if (msg.length > 0) {
        const sa_id = (+new Date()).toString(36);
        setEvents((events) => [
          ...events,
          {
            message: msg,
            sender: globals.self,
            sa_id: sa_id,
            posted: moment()
          }
        ]);

        sentMessageIds.current.push(sa_id);
        setMessageStatuses((messageStatuses) => ({
          ...messageStatuses,
          [sa_id]: '◔'
        }));

        ApiClient.post(
          `chatrooms/${roomID.current}/messages/create`,
          {
            message: msg,
            sa_id: sa_id
          },
          {
            onSuccess: (data) => {
              setEvents((events) => {
                let eventIndex = events.findIndex(
                  (elem) => elem.sa_id === sa_id
                );
                if (eventIndex < 0) {
                  return events;
                }
                let _events = [...events];
                let _event = _events[eventIndex];
                _event.id = data.id;
                _events[eventIndex] = _event;
                return _events;
              });
              setMessageStatuses((messageStatuses) => ({
                ...messageStatuses,
                [sa_id]: '✓'
              }));
            },
            onError: () => {
              setMessageStatuses((messageStatuses) => ({
                ...messageStatuses,
                [sa_id]: "Couldn't Send"
              }));
            }
          }
        );
      }
      scrollToBottom();
      setMessage('');
      setAttachedPhoto(null);
    }
  };

  useEffect(() => {
    if (socket) {
      if (initialLoad.current) {
        // only reload on reconnects
        initialLoad.current = false;
      } else {
        refreshMessages(roomID.current);
      }
    }
  }, [socket]);

  const scrollToBottom = (smooth = true) => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 99999999, behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  return (
    <div className='chatBox col'>
      <PageHeader title={roomName} />
      <div className='chatBox-title row-c-c'>
        <div className='chatBox-title__in row-c-c'>
          <div className='pHead chatBox-title__in__in row-fs-c'>
            <div className='block md:hidden'>
              <BackButton href={`/chat`} globals={globals} />
            </div>
            <h1>{roomName}</h1>
            <Nav
              globals={globals}
              refreshData={refreshData}
              className='ml-auto pHead--nav'
            ></Nav>
          </div>
        </div>
        <div className='chatBox-title__bg' />
      </div>

      {uploading && (
        <div
          className='bg-gray-600 text-white px-10 py-4 fixed flex items-center justify-center rounded shadow-md'
          style={{
            width: 'fit-content',
            zIndex: 100,
            left: '50%',
            top: 70,
            transform: 'translate(-50%, 0%)'
          }}
        >
          Uploading Image &nbsp;
          <Loader type='Oval' color='white' height={20} width={20} />
        </div>
      )}

      <div className='chatBox-chatMessages'>
        <InfiniteScroll
          reverse={true}
          onDataLoad={(data) => {
            setEvents((events) => [...data.reverse(), ...events]);
          }}
          path={`chatrooms/${room}/messages`}
          key={`chatrooms/${room}/messages`}
          useWindowScroll={true}
          initialHasNext={hasNext}
          tolerance={600}
        >
          {events.map((event, idx) => (
            <ChatMessage
              key={idx}
              event={event}
              last={idx === events.length - 1}
              status={
                event.sa_id && event.sa_id in messageStatuses
                  ? messageStatuses[event.sa_id]
                  : null
              }
              prevSender={idx >= 1 && events[idx - 1].sender.id}
              nextSender={idx < events.length - 1 && events[idx + 1].sender.id}
              self={globals.self}
            />
          ))}
        </InfiniteScroll>
      </div>

      <div className='chatBox-composerContainer row-fs-c'>
        {attachedPhoto && (
          <div className='chatBox-attachedImage'>
            <img
              style={{ maxWidth: 120, maxHeight: 120 }}
              src={attachedPhoto}
            />
            <div
              className='deleteCircle cursor-pointer'
              onClick={() => setAttachedPhoto(null)}
            >
              <XCircle />
            </div>
          </div>
        )}
        <XInput
          containerClassName='chatBox-composer'
          value={message}
          placeholder='Type your message here'
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSubmit();
            }
          }}
          onChange={(e) => {
            if (e.target) setMessage(e.target.value);
          }}
        />
        <div style={{ marginRight: 16 }}>
          <label htmlFor='file-upload' className='w-full h-full cursor-pointer'>
            <input
              id='file-upload'
              accept='image/*'
              type='file'
              key={inputKey}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setUploading(true);
                  var type = event.target.files[0].type;
                  var filename = [
                    uuidv4(),
                    '.',
                    type.match(/^image\/(\w+)$/i)[1]
                  ].join('');
                  ApiClient.upload_file(
                    `post/upload_file/${filename}`,
                    event.target.files[0],
                    type,
                    {
                      onReturn: () => {
                        setInputKey((inputKey) => inputKey + 1);
                        setUploading(false);
                      },
                      onSuccess: (data) => {
                        setAttachedPhoto(data.file_url);
                      },
                      onError: (error) => {
                        console.log(error);
                      }
                    }
                  );
                }
              }}
              style={{ display: 'none' }}
            />
            <Image />
          </label>
        </div>
        <XButton className='chatBox-sendBtn' onClick={onSubmit}>
          <Send style={{ marginRight: 3, marginTop: 3 }} />
        </XButton>
      </div>
    </div>
  );
};

export default ChatBox;
