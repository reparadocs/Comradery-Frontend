import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'react-feather';
import ApiClient from '../ApiClient.js';
import Modal from 'react-bootstrap/Modal';
import XButton from './XButton';
import XInput from './XInput';
import { getSubdomain, getHost } from '../utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { setCookie, destroyCookie } from 'nookies';
import ErrorMessage from './ErrorMessage';
import { useToasts } from 'react-toast-notifications';
import { GoogleLogin } from 'react-google-login';

const AuthModal = ({
  community,
  show,
  handleClose,
  login,
  setLogin,
  invite_code,
  showAuthRequiredMessage
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [email, setEmail] = useState('');
  const [forgot, setForgot] = useState(false);
  const { addToast } = useToasts();

  const validate = (values) => {
    if (
      !/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
        values.email
      )
    ) {
      return { error: 'Invalid email address' };
    }

    if (values.displayname.length > 100) {
      return { error: 'Username too long' };
    }

    if (values.displayname.length < 4) {
      return { error: 'Username too short' };
    }

    if (values.password !== values.verifyPassword) {
      return { error: "Passwords don't match" };
    }

    if (values.password.length < 5) {
      return { error: 'Password too short' };
    }

    return { error: false, values };
  };

  const onClose = () => {
    setUsername('');
    setPassword('');
    setVerifyPassword('');
    setEmail('');
    handleClose();
  };

  var options = {
    auth: false,
    validate: null,
    onReturn: () => {
      setLoading(false);
    },
    onError: (error) => {
      if (getHost() === 'community.comradery.io') {
        setError('Read Only Demo - email hello@comradery.io for full demo');
      } else {
        setError(error);
      }
    },
    onSuccess: (data) => {
      setCookie({}, getSubdomain(), data.token, {
        path: '/',
        expires: new Date('Sat, 22 Feb 2030 06:06:24 GMT')
      });
      if (typeof window !== 'undefined') {
        window.location = window.location.pathname;
      }
      onClose();
    }
  };

  var registerOptions = { ...options };
  registerOptions['validate'] = validate;

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    if (login) {
      if (forgot) {
        ApiClient.post(
          `request_password_reset/${getHost()}`,
          { email: email },
          {
            auth: false,
            onReturn: () => setLoading(false),
            onError: (error) => {
              setError(error);
            },
            onSuccess: () => {
              addToast(
                "If that account exists, we've sent an email to it with instructions!",
                {
                  appearance: 'success',
                  autoDismiss: true,
                  placement: 'top-center',
                  autoDismissTimeout: 3000
                }
              );
              onClose();
            }
          }
        );
      } else {
        ApiClient.auth_fetch(
          '_login',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization:
                'Basic ' +
                btoa(
                  unescape(
                    encodeURIComponent(
                      community.name + '__' + email + ':' + password
                    )
                  )
                )
            },
            method: 'POST'
          },
          options
        );
      }
    } else {
      const { error } = ApiClient.post(
        'register_user',
        {
          community: community.name,
          email,
          displayname: username,
          password,
          verifyPassword,
          invite_code
        },
        registerOptions
      );
      if (getHost() === 'community.comradery.io') {
        setError('Read Only Demo - email hello@comradery.io for full demo');
      } else {
        setError(error);
      }
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {login ? (forgot ? 'Reset Password' : 'Login') : 'Create Account'}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          {community && community.private ? (
            <div className='w-full text-center text-gray-600 mb-2 font-semibold'>
              This is a private community. Please
              {login ? ' login ' : ' create an account '} to access this
              community!
            </div>
          ) : (
            showAuthRequiredMessage && (
              <div className='w-full text-center text-gray-600 mb-2 font-semibold'>
                You need to be logged in to do that!
              </div>
            )
          )}
          {community.auth_enabled === 'google' && (
            <div className='flex flex-col items-center'>
              <div className='mb-2'>
                <GoogleLogin
                  clientId='1085257814258-n2h5ihsducfpdp39hm331ub7ag31vmuh.apps.googleusercontent.com'
                  buttonText='Login'
                  onSuccess={(resp) =>
                    ApiClient.post(
                      `google_auth`,
                      {
                        community: community.name,
                        google_token: resp.tokenId,
                        invite_code
                      },
                      options
                    )
                  }
                  onFailure={(error) => console.log(error)}
                  cookiePolicy={'single_host_origin'}
                />
              </div>
              Or
            </div>
          )}

          <XInput
            containerClassName='mb-4'
            type='email'
            label='Email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!login && (
            <XInput
              type='text'
              containerClassName='mb-4'
              label='Display Name (Visible to Others)'
              placeholder='Display Name'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          {(!login || !forgot) && (
            <XInput
              type='password'
              label='Password'
              containerClassName='mb-2'
              placeholder='********'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
          {login && (
            <div
              onClick={() => setForgot((forgot) => !forgot)}
              className='text-blue-500 text-sm cursor-pointer hover:text-blue-700'
              style={{ width: 'fit-content' }}
            >
              {forgot ? 'Back to Login' : 'Forgot your password?'}
            </div>
          )}
          {!login && (
            <XInput
              type='password'
              containerClassName='mb-4'
              label='Verify Password'
              placeholder='********'
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
            />
          )}
        </Modal.Body>
        <Modal.Footer className='flex-col cmr c-auth-footer-1'>
          <ErrorMessage
            error={error}
            className='mb-3 items-center text-center'
          />
          <div className='flex flex-row w-full items-center cmr c-auth-footer-2'>
            <a
              onClick={() => {
                setError(false);
                setLogin(!login);
              }}
              className='inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 cmr c-auth-switch-mode'
              href='#'
            >
              Switch to {login ? 'Create Account' : 'Login'}
            </a>

            <XButton
              className='ml-auto cmr c-auth-action'
              variant='primary'
              type='submit'
              loading={loading}
            >
              {login ? (forgot ? 'Send Email' : 'Login') : 'Create Account'}
            </XButton>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AuthModal;
