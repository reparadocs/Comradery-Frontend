import React, { useState, useEffect } from 'react';
import XButton from '../components/XButton';
import PageLoading from '../components/PageLoading';
import { capitalize } from '../utils';
import ApiClient from '../ApiClient';
let cn = require('classnames');
import { PageHeader } from '../components/Common';
import Notifications from '../components/notifications/Notifications';
import Nav from '../components/Nav';

export default ({ globals, refreshData }) => {
  const [frequency, setFrequency] = useState(null);
  const [digestFrequency, setDigestFrequency] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    globals.setTab('posts');

    if (globals.authRequired()) {
      ApiClient.get('notification_frequency', {
        onSuccess: (data) => {
          setFrequency(data.notification_frequency);
          setDigestFrequency(data.digest_frequency);
        },
        onError: () => globals.pageError()
      });
    }
  }, []);

  function onSubmit() {
    if (globals.authRequired()) {
      setLoading(true);

      ApiClient.post(
        'notification_frequency',
        {
          notification_frequency: frequency,
          digest_frequency: digestFrequency
        },
        {
          onReturn: () => setLoading(false),
          onSuccess: () => setSaved(true)
        }
      );
    }
  }

  if (!frequency) return <PageLoading />;

  return (
    <div className='flex mt-4 flex-col items-center cmr c-settings-notifications-1'>
      <PageHeader title='Notification Settings' />
      <div className='pHead row-sb-c'>
        <h1>Notification Settings</h1>
        <Nav
          globals={globals}
          refreshData={refreshData}
          className='ml-auto pHead--nav'
        ></Nav>
      </div>
      <div className='flex flex-col px-5 items-center mt-5 w-full max-w-4xl'>
        <div>
          At most, how often do you want to receive notification updates over
          email?
        </div>
        <div className='flex flex-row justify-around w-full mt-4 mb-10'>
          {['hourly', 'daily', 'never'].map((item, index) => (
            <div
              key={index}
              onClick={() => {
                setFrequency(item);
                setSaved(false);
              }}
              className={cn([
                'cursor-pointer flex h-12 items-center text-center justify-center flex-1 ml-2 mr-2 bg-gray-300',
                {
                  'bg-blue-400 text-white': frequency === item
                }
              ])}
            >
              {capitalize(item)}
            </div>
          ))}
        </div>
        <div className='flex flex-col px-5 items-center mt-5 w-full max-w-4xl'>
          <div>
            How often do you want to receive community digests over email?
          </div>
          <div className='flex flex-row justify-around w-full mt-4 mb-10'>
            {['daily', 'weekly', 'never'].map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setDigestFrequency(item);
                  setSaved(false);
                }}
                className={cn([
                  'cursor-pointer flex h-12 items-center text-center justify-center flex-1 ml-2 mr-2 bg-gray-300',
                  {
                    'bg-blue-400 text-white': digestFrequency === item
                  }
                ])}
              >
                {capitalize(item)}
              </div>
            ))}
          </div>
        </div>
        {saved && <div className='text-green-500'>Saved!</div>}
        <XButton onClick={onSubmit} loading={loading} className='w-64 mt-2'>
          Save
        </XButton>
      </div>
    </div>
  );
};
