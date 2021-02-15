import XInput from '../XInput';
import Callout from '../Callout';
import React, { useState, useEffect } from 'react';
import XTextArea from '../XTextArea';
import XButton from '../XButton';
import Loader from 'react-loader-spinner';
import ErrorMessage from '../ErrorMessage';
import PhotoUpload from '../PhotoUpload';
import { getHost, isUrl } from '../../utils';
import ApiClient, { initialPropsHelper } from '../../ApiClient.js';
import { Label } from '../Common';
import ProPlanCard from './ProPlanCard';

const CustomizationSettings = ({ community, setCommunity }) => {
  const [cssLoading, setCssLoading] = useState(true);
  const [cssFetched, setCssFetched] = useState(false);
  const [faviconLoading, setFaviconLoading] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [faviconKey, setFaviconKey] = useState(0);

  useEffect(() => {
    if (!cssFetched && community) {
      setCssFetched(true);
      if (community.custom_stylesheet) {
        fetch(community.custom_stylesheet)
          .then((data) => data.text())
          .then((data) => {
            setCssLoading(false);
            setCommunity({ ...community, custom_css: data });
          });
      } else {
        setCssLoading(false);
      }
    }
  }, [community]);

  const onSelectFavicon = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFaviconError(false);
      setFaviconLoading(true);
      ApiClient.upload_photo(
        `community/${getHost()}/upload_favicon`,
        event.target.files[0],
        'favicon',
        {
          onReturn: () => {
            setFaviconLoading(false);
            setFaviconKey((faviconKey) => faviconKey + 1);
          },
          onSuccess: (data) => {
            setCommunity({ ...community, favicon: data.favicon_url });
          },
          onError: () => setFaviconError(true)
        }
      );
    }
  };

  return (
    <div className='admin-inner col'>
      <Label className='large' marginTop={true}>
        Logo
      </Label>
      <div className='group'>
        <div className='text-lg mb-3'>Navbar</div>

        <div className='flex flex-row items-center justify-between mb-10'>
          {community.photo && (
            <div style={{ height: 70, width: 200 }}>
              <img
                alt='community logo'
                src={community.photo}
                style={{ height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          <PhotoUpload
            _defaultCrop={{
              width: 200,
              height: 70,
              x: 0,
              y: 0
            }}
            path={`community/${getHost()}/upload_photo`}
            onChange={(photo) => setCommunity({ ...community, photo })}
          >
            <div className='border rounded border-gray-500 p-4 hover:bg-gray-300'>
              {community.photo ? 'Change Logo' : 'Add Logo'}
            </div>
          </PhotoUpload>
        </div>
        <div className='text-lg mb-3'>Favicon (.ico)</div>
        <div className='flex flex-row mb-10 items-center justify-between'>
          {community.favicon && (
            <img
              src={community.favicon}
              alt='community favicon'
              style={{ height: 48, width: 48 }}
            />
          )}

          <label htmlFor='favicon-upload' className='cursor-pointer'>
            <input
              id='favicon-upload'
              accept='image/x-icon'
              type='file'
              key={faviconKey}
              style={{ display: 'none' }}
              onChange={onSelectFavicon}
            />
            <div className='border rounded border-gray-500 p-4 hover:bg-gray-300'>
              {faviconLoading ? (
                <Loader type='Oval' color='black' height={20} width={20} />
              ) : community.favicon ? (
                'Change Favicon'
              ) : (
                'Add Favicon'
              )}
            </div>
          </label>
          <ErrorMessage className='ml-3' error={faviconError} />
        </div>
      </div>
      <Label className='large' marginTop={true}>
        Custom CSS
      </Label>
      <div className='group'>
        <Callout title='Custom CSS' className='mb-4 mt-2'>
          <p>
            Please read the Custom CSS Guide&nbsp;
            <a
              href='https://comradery.readme.io/docs/custom-css'
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
            {cssLoading ? (
              <div
                className='w-full justify-center items-center flex'
                style={{ height: 200 }}
              >
                <Loader type='Oval' color='black' height={30} width={30} />
              </div>
            ) : (
              <XTextArea
                style={{ height: 250 }}
                className='mb-4'
                value={community.custom_css || ''}
                onChange={(e) =>
                  setCommunity({ ...community, custom_css: e.target.value })
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizationSettings;
