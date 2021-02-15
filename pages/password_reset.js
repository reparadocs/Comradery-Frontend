import React, { useState, useEffect } from 'react';
import XButton from '../components/XButton';
import PageLoading from '../components/PageLoading';
import { capitalize } from '../utils';
import ApiClient from '../ApiClient';
let cn = require('classnames');
import { PageHeader } from '../components/Common';
import Notifications from '../components/notifications/Notifications';
import Nav from '../components/Nav';
import XInput from '../components/XInput';
import ErrorMessage from '../components/ErrorMessage';
import { Router, useRouter } from 'next/router';
import { useToasts } from 'react-toast-notifications';

export default ({ globals, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [verifyPassword, setVerifyPassword] = useState('');

  const router = useRouter();
  const { addToast } = useToasts();

  useEffect(() => {
    globals.setTab('posts');
  }, []);

  const validate = (values) => {
    if (values.password !== values.verifyPassword) {
      return { error: "Passwords don't match" };
    }

    if (values.password.length < 5) {
      return { error: 'Password too short' };
    }

    return { error: false, values };
  };

  const onSubmit = () => {
    setError(false);
    if (globals.authRequired()) {
      setLoading(true);

      const { error } = ApiClient.post(
        'password_reset',
        { password: password, verifyPassword: verifyPassword },
        {
          validate: validate,
          onReturn: () => setLoading(false),
          onError: () => setError(true),
          onSuccess: () => {
            router.push(`/`);

            addToast('Saved!', {
              appearance: 'success',
              autoDismiss: true,
              placement: 'top-center',
              autoDismissTimeout: 3000
            });
          }
        }
      );

      if (error) {
        setError(error);
      }
    }
  };

  return (
    <div className='flex mt-4 flex-col items-center cmr c-settings-notifications-1'>
      <PageHeader title='Password Reset' />
      <div className='pHead row-sb-c'>
        <h1>Password Reset</h1>
        <Nav
          globals={globals}
          refreshData={refreshData}
          className='ml-auto pHead--nav'
        ></Nav>
      </div>
      <div className='flex flex-col px-5 items-center mt-5 w-full max-w-4xl'>
        <div className='flex flex-col w-96 mt-4 mb-10'>
          <XInput
            type='password'
            label='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <XInput
            containerClassName='mt-10'
            type='password'
            label='Verify Password'
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
          />
        </div>
        <ErrorMessage error={error} />
        <XButton onClick={onSubmit} loading={loading} className='w-64 mt-2'>
          Save
        </XButton>
      </div>
    </div>
  );
};
