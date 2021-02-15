import React, { useState, useEffect } from 'react';
import ApiClient, { initialPropsHelper } from '../ApiClient.js';
import BasicSettings from '../components/admin/BasicSettings';
import CustomizationSettings from '../components/admin/CustomizationSettings';
import AdvancedSettings from '../components/admin/AdvancedSettings';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import MemberSettings from '../components/admin/MemberSettings';
import { PageHeader } from '../components/Common';
import { getHost, isUrl } from '../utils';
import XInput from '../components/XInput';
import ErrorMessage from '../components/ErrorMessage';
import XButton from '../components/XButton';
import Modal from 'react-bootstrap/Modal';
import Loader from 'react-loader-spinner';
import { useRouter } from 'next/router';
import PhotoUpload from '../components/PhotoUpload';
import XTextArea from '../components/XTextArea';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Callout from '../components/Callout';
import PageLoading from '../components/PageLoading';
import Nav from '../components/Nav';
import Notifications from '../components/notifications/Notifications';
import InviteSettings from '../components/admin/InviteSettings.js';
let cn = require('classnames');

function Admin({ globals, _community, refreshData, query }) {
  const [community, setCommunity] = useState(_community);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const pages = [
    { name: 'Basic', component: BasicSettings },
    { name: 'Customization', component: CustomizationSettings },
    { name: 'Advanced', component: AdvancedSettings },
    { name: 'Analytics', component: AdminAnalytics },
    { name: 'Invite Users', component: InviteSettings }
  ];

  useEffect(() => {
    globals.setTab('posts');

    if (!community) {
      ApiClient.get(`community/${getHost()}`, {
        onError: () => globals.pageError(),
        onSuccess: (data) => {
          setCommunity(data);
        }
      });
    }
  }, []);

  const validate = (community) => {
    if (community.channels.length <= 0) {
      return { error: 'Must have at least one channel' };
    }

    for (var i = 0; i < community.channels.length; i++) {
      let name = community.channels[i].name;

      if (name.length <= 2) {
        return { error: `${name} is too short` };
      }

      if (name.length > 25) {
        return { error: `${name} is too long` };
      }
    }

    if (
      community.logout_redirect &&
      community.logout_redirect.length > 0 &&
      !isUrl(community.logout_redirect)
    ) {
      return { error: 'Logout redirect must be a valid URL' };
    }

    if (
      community.login_redirect &&
      community.login_redirect.length > 0 &&
      !isUrl(community.login_redirect)
    ) {
      return { error: 'Login redirect must be a valid URL' };
    }

    if (community.welcome_title && community.welcome_title.length > 100) {
      return { error: 'Welcome title must be less than 100 characters' };
    }

    if (community.welcome_content && community.welcome_content.length > 500) {
      return { error: 'Welcome content must be less than 500 characters' };
    }

    for (var i = 0; i < community.links.length; i++) {
      let link = community.links[i];

      if (link.label.length <= 0) {
        return { error: 'Titles cannot be blank' };
      }

      if (link.label.length > 15) {
        return { error: `${link.label} is too long` };
      }

      if (!isUrl(link.url)) {
        return { error: 'URLs must be valid' };
      }
    }

    for (var i = 0; i < community.chatrooms.length; i++) {
      let room = community.chatrooms[i];

      if (room.name.length <= 0) {
        return { error: 'Titles cannot be blank' };
      }

      if (room.name.length > 15) {
        return { error: `${room.name} is too long` };
      }
    }

    return { error: false, community };
  };

  const handleSubmit = () => {
    setError(false);

    if (globals.authRequired()) {
      setSubmitLoading(true);
      const { error } = ApiClient.post(`community/${getHost()}`, community, {
        onReturn: () => setSubmitLoading(false),
        onSuccess: (data) => {
          refreshData();
          router.push(`/`);
        },
        onError: () => setError(true),
        validate
      });
      setError(error);
    }
  };

  if (!community) return <PageLoading />;

  const pageNum = query.page ? parseInt(query.page, 10) : 0;
  const ActiveComponent = pages[pageNum].component;

  return (
    <div className='admin col cmr c-admin-container pc-container'>
      <PageHeader title='Admin Panel' />
      <div className='pHead feedNav wide admin-topInfo row-sb-c'>
        <h1>Admin Panel</h1>
        <a className='row-c-c ml-4' href='mailto:hello@comradery.io'>
          Send Feedback <span>→</span>
        </a>
        <Nav
          globals={globals}
          refreshData={refreshData}
          className='ml-auto pHead--nav'
        ></Nav>
      </div>

      <div className='admin-nav'>
        <div className='row-fs-c'>
          {pages.map((item, index) => (
            <div
              key={index}
              onClick={() =>
                router.push({ pathname: '/admin', query: { page: index } })
              }
              className={cn([
                'admin-nav-item',
                'col-c-c',
                { selected: pageNum === index }
              ])}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
      <ActiveComponent community={community} setCommunity={setCommunity} />
      {pages[pageNum].name !== 'Invite Users' &&
        pages[pageNum].name !== 'Analytics' && (
          <div className='mt-3 flex-row w-full'>
            <ErrorMessage
              error={error}
              className='mb-3 items-center text-center'
            />
            <XButton
              containerClassName='ml-auto'
              onClick={handleSubmit}
              className='ml-auto'
              loading={submitLoading}
            >
              Save All
            </XButton>
          </div>
        )}
    </div>
  );
}

Admin.getInitialProps = async function (ctx) {
  return initialPropsHelper(ctx, `community/${getHost(ctx)}`, '_community');
};

export default Admin;
