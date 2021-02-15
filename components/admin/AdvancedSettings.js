import XInput from '../XInput';
import Callout from '../Callout';
import XTextArea from '../XTextArea';
import XButton from '../XButton';
import Loader from 'react-loader-spinner';
import ApiClient from '../../ApiClient.js';
import { Label } from '../Common';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import React, { useState, useEffect } from 'react';
import ProPlanCard from './ProPlanCard';

const AdvancedSettings = ({ community, setCommunity }) => {
  const [apiKey, setApiKey] = useState(null);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  return (
    <div className='admin-inner col'>
      <Label className='large' marginTop={true}>
        API
      </Label>
      <div className='group'>
        <div className='flex flex-col'>
          <Callout title='API Key'>
            <p>
              Please read the API documentation&nbsp;
              <a
                href='https://comradery.readme.io/reference'
                className='underline hover:text-blue-900'
              >
                here
              </a>
            </p>
          </Callout>
          {community.free ? (
            <ProPlanCard />
          ) : (
            <div>
              {!apiKey && (
                <div>
                  <div className='mt-2 font-bold mt-4 text-red-600 text-center'>
                    Generating a new API Key will deactivate any previous API
                    Keys.
                  </div>
                  <div className='flex flex-row w-full justify-center items-center my-3'>
                    <XButton
                      onClick={() =>
                        ApiClient.post(
                          'generate_superadmin_token',
                          {},
                          { onSuccess: (data) => setApiKey(data.token) }
                        )
                      }
                    >
                      Generate API Key
                    </XButton>
                  </div>
                </div>
              )}
              {apiKey && (
                <div>
                  <div className='mt-2'>
                    Click to copy. Please store securely - this key will not be
                    shown again.
                    {apiKeyCopied && (
                      <span className='text-green-500'>&nbsp;Copied!</span>
                    )}
                  </div>
                  <div className='flex flex-row items-center my-3'>
                    <CopyToClipboard
                      text={apiKey}
                      onCopy={() => setApiKeyCopied(true)}
                    >
                      <div
                        className='cursor-pointer text-blue-500 hover:text-blue-700 overflow-hidden'
                        style={{ 'word-break': 'break-word' }}
                      >
                        {apiKey}
                      </div>
                    </CopyToClipboard>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Label className='large' marginTop={true}>
        User Sync
      </Label>
      <div className='group'>
        <Callout title='User Sync' className='mb-4'>
          <p>
            Please read the User Sync Guide&nbsp;
            <a
              href='https://comradery.readme.io/docs/getting-started'
              className='underline hover:text-blue-900'
            >
              here
            </a>
          </p>
        </Callout>
        {community.free ? (
          <ProPlanCard />
        ) : (
          <div>
            <div className='text-lg'>Logout Redirect</div>

            <XInput
              className='mb-4'
              placeholder='Logout Redirect URL'
              value={community.logout_redirect || ''}
              onChange={(e) =>
                setCommunity({ ...community, logout_redirect: e.target.value })
              }
            />

            <div className='text-lg'>Login Redirect</div>
            <XInput
              className='mb-4'
              placeholder='Login Redirect URL'
              value={community.login_redirect || ''}
              onChange={(e) =>
                setCommunity({ ...community, login_redirect: e.target.value })
              }
            />
          </div>
        )}
      </div>
      <Label className='large' marginTop={true}>
        Segment (Analytics)
      </Label>

      <div className='group'>
        <div className='flex flex-col'>
          <Callout title='Segment' className='mb-4'>
            <p>
              Please read the Segment Guide&nbsp;
              <a
                href='https://comradery.readme.io/docs/segment-analytis'
                className='underline hover:text-blue-900'
              >
                here
              </a>
            </p>
          </Callout>
          {community.free ? (
            <ProPlanCard />
          ) : (
            <div>
              <div className='text-lg'>Segment Write Key</div>
              <div className='flex flex-row items-center'>
                <div className='w-2/3'>
                  <XInput
                    className='mb-4'
                    placeholder='Segment Write Key'
                    value={community.write_key}
                    onChange={(e) =>
                      setCommunity({ ...community, write_key: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {community.trusted && (
        <div className='w-full'>
          <Label className='large' marginTop={true}>
            Custom Header (HTML)
          </Label>
          <div className='group'>
            <div>
              <XTextArea
                style={{ height: 250 }}
                className='mb-4'
                value={community.custom_header || ''}
                onChange={(e) =>
                  setCommunity({ ...community, custom_header: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;
