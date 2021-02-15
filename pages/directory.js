import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import XButton from '../components/XButton';
import Dropdown from '../components/Dropdown';
import ErrorMessage from '../components/ErrorMessage';
import { PageHeader, Label, BackButton } from '../components/Common';
import PostEditor from '../components/PostEditor';
import BackLink from '../components/BackLink';
import Notifications from '../components/notifications/Notifications';
import ApiClient, { initialPropsHelper } from '../ApiClient';
import { getHost, getSubdomain } from '../utils';
import UserPhoto from '../components/UserPhoto';
import Link from 'next/link';
import Nav from '../components/Nav';
import PageLoading from '../components/PageLoading';
import { ArrowRight } from 'react-feather';

function Directory({ globals, _people, refreshData }) {
  const [people, setPeople] = useState(_people);

  useEffect(() => {
    globals.setTab('people');
    if (!_people) {
      ApiClient.get(`community/${getHost()}/people`, {
        onError: () => globals.pageError(),
        onSuccess: (data) => {
          setPeople(data);
        }
      });
    }
  }, []);

  if (!people) return <PageLoading />;

  return (
    <div className='directory cmr c-directory-container'>
      <PageHeader title='Directory' />

      <div className='pHead feedNav row-sb-c'>
        <h1>Directory</h1>
        <Nav
          globals={globals}
          refreshData={refreshData}
          className='pHead--nav'
        ></Nav>
      </div>

      <div className='directory-list'>
        {people.map((person, idx) => (
          <Link key={idx} href='/profile/[id]' as={`profile/${person.id}`}>
            <div className='directory-entry col-c-c'>
              <div className='top col-c-c'>
                <div className='top-in col-c-c'>
                  <UserPhoto person={person} className='directory-photo' />
                </div>
              </div>
              <div className='bottom col-c-c'>
                <span>{person.username}</span>
                <div>View Profile</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

Directory.getInitialProps = async function (ctx) {
  return await initialPropsHelper(
    ctx,
    `community/${getHost(ctx)}/people`,
    '_people'
  );
};

export default Directory;
