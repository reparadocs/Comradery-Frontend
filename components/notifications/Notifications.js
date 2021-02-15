import { useState, useEffect, useRef } from 'react';
import Router from 'next/router';

import NotificationCard from './NotificationCard';
import ApiClient from '../../ApiClient';
import useSWR from 'swr';
import Bell from '../../components/icons/Bell';
import InfiniteScroll from '../InfiniteScroll';
let cn = require('classnames');

function Notifications({ mobile = false }) {
  const [open, setOpen] = useState(false);
  const unread = useRef(0);
  const [notifications, setNotifications] = useState([]);
  const [initialHasNext, setInitialHasNext] = useState(false);
  const [showUnread, setShowUnread] = useState(false);
  const [error, setError] = useState(false);

  const refreshNotifications = () => {
    ApiClient.get('notifications', {
      onSuccess: (data) => {
        setNotifications(data.data);
        setInitialHasNext(data.has_next);
      },
      onError: () => {
        setError(true);
      }
    });
  };

  const notificationCheck = (initial = false) => {
    ApiClient.get('notification_check', {
      onSuccess: (data) => {
        const currentCount = parseInt(data.n);
        if (currentCount !== unread.current) {
          if (currentCount > unread.current && !initial) {
            refreshNotifications();
          }
          unread.current = currentCount;
          if (currentCount > 0) {
            setShowUnread(true);
          }
        }
      }
    });
  };

  const closeTray = () => {
    ApiClient.post('notifications', {});
    unread.current = 0;
    setShowUnread(false);

    setOpen(false);
    setNotifications(
      notifications.map((val) => {
        return { ...val, read: true };
      })
    );
  };

  useSWR('notificationCheck', () => notificationCheck(), {
    refreshInterval: 10 * 1000
  });

  useEffect(() => {
    refreshNotifications();
  }, []);

  return (
    <div
      id='notification-container'
      className='relative flex outline-none'
      onBlur={() =>
        setTimeout(() => {
          if (open) {
            closeTray();
          }
        }, 200)
      }
      tabIndex={0}
    >
      <div
        id='notification-icon'
        style={{ width: 36, height: 36 }}
        className='cursor-pointer col-c-c relative'
        onClick={() => {
          if (!open) {
            setOpen(true);
          } else {
            closeTray();
          }
        }}
      >
        <Bell color={'#e7f2fa'} />
        {showUnread && (
          <div
            style={{ height: 8, width: 8, right: 2, bottom: 4 }}
            className='bg-red-500 fixed rounded-full cmr absolute c-notif-icon-unread'
          />
        )}
      </div>

      {open && (
        <div
          style={{
            height: 360,
            top: 34,
            zIndex: 40
          }}
          className={cn([
            'right-0 left-auto',
            'absolute w-72 rounded-lg border-solid border-2 border-gray-200 bg-white shadow-lg overflow-hidden cmr c-notif-tray'
          ])}
        >
          {notifications.length ? (
            <InfiniteScroll
              path='notifications'
              className='h-full'
              tolerance={400}
              initialHasNext={initialHasNext}
              onDataLoad={(data) =>
                setNotifications((notifications) => [...notifications, ...data])
              }
            >
              {notifications.map((notification, idx) => (
                <NotificationCard
                  notification={notification}
                  closeTray={() => closeTray()}
                  key={idx}
                />
              ))}
            </InfiniteScroll>
          ) : (
            <div className='select-none flex items-center justify-center w-full h-full text-gray-600'>
              No Notifications To Show
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;
