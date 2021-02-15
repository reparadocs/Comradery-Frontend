import moment from 'moment';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Loader from 'react-loader-spinner';
import ApiClient, { initialPropsHelper } from '../../ApiClient';
import '../../style.css';
import PostCard from '../../components/PostCard';
import UserPhoto from '../../components/UserPhoto';
import PageLoading from '../../components/PageLoading';
import {
  EditButton,
  PageHeader,
  BackButton,
  TitleComponent
} from '../../components/Common';
import { useRouter } from 'next/router';
import EditProfileLink from '../../components/EditProfileLink';
import Spinner from '../../components/Spinner';
import XButton from '../../components/XButton';
import Notifications from '../../components/notifications/Notifications';
import { Edit3 } from 'react-feather';
import Nav from '../../components/Nav';
import Email from '../../components/icons/Email';
import Facebook from '../../components/icons/Facebook';
import Instagram from '../../components/icons/Instagram';
import Twitter from '../../components/icons/Twitter';
import Linkify from 'react-linkify';

const componentDecorator = (href, text, key) => {
  if (href.match(/\.(jpeg|jpg|gif|png)$/) != null) {
    return (
      <img
        style={{ maxWidth: '30vw', maxHeight: '30vh' }}
        src={href}
        key={key}
      />
    );
  }

  return (
    <a
      href={href}
      key={key}
      style={{ textDecoration: 'underline' }}
      target='_blank'
      ref='nofollow noindex noopener'
    >
      {text}
    </a>
  );
};

const EditProfileContainer = ({ globals, person, children }) => (
  <EditProfileLink profile={person}>
    <div
      className='outline-none cursor-pointer'
      onClick={() =>
        globals.track('Profile - Edit Profile Clicked', {
          id: person.id,
          username: person.username
        })
      }
    >
      {children}
    </div>
  </EditProfileLink>
);

function Profile({ globals, _person, query, refreshData }) {
  const [person, setPerson] = useState(_person);
  const [messageLoading, setMessageLoading] = useState(false);
  const [loading, setLoading] = useState(_person ? false : true);
  const [tab, setTab] = useState('posts');
  let router = useRouter();

  const refreshPerson = (id) => {
    setLoading(true);
    ApiClient.get(`_person/${id}`, {
      onReturn: () => setLoading(false),
      onError: () => globals.pageError(),
      onSuccess: (data) => {
        setPerson(data);
      }
    });
  };

  useEffect(() => {
    globals.setTab('people');

    if (!_person) {
      refreshPerson(query.id);
    }
  }, []);

  useEffect(() => {
    refreshPerson(query.id);
  }, [query]);

  if (loading || !person) return <PageLoading />;

  return (
    <div className='viewProfile cmr c-profile-container'>
      <PageHeader title={person.username} />

      <div className='pHead row-sb-c indexChannels items-center'>
        <BackButton light={true} href={`/directory`} globals={globals} />

        <div className='row-fs-c'>
          {person.editable && (
            <EditProfileContainer person={person} globals={globals}>
              <EditButton light={true} />
            </EditProfileContainer>
          )}
          <Nav
            globals={globals}
            refreshData={refreshData}
            className='pHead--nav'
          ></Nav>
        </div>

      </div>

      <div className='viewProfile--userInfo row'>
        <div className='inner'>
          <div className='img'>
            <UserPhoto person={person} size={184} />
          </div>
          {globals.self && globals.self.id === person.id ? null : (
            <XButton
              loading={messageLoading}
              onClick={() => {
                if (globals.authRequired()) {
                  setMessageLoading(true);
                  globals.createDirectMessage(person.id);
                }
              }}
              className='chat col-c-c'
            >
              Start a chat
            </XButton>
          )}
          {/*
          <div className='viewProfile-socials row'>
            <div className='social col-c-c'>
              <Email />
            </div>
            <div className='social col-c-c'>
              <Facebook />
            </div>
            <div className='social col-c-c'>
              <Instagram />
            </div>
            <div className='social col-c-c'>
              <Twitter />
            </div>
          </div>*/}
        </div>
        <div className='viewProfile--right col'>
          <div className='top'>
            <div className='viewProfile--name'>{person.username}</div>
            <span className='viewProfile--status'>Member</span>
          </div>
          <div className='content'>
            {person.bio && (
              <div>
                <label>Bio</label>
                <p>{person.bio}</p>
              </div>
            )}
            {person.custom_field_values.map((field, idx) =>
              field.value ? (
                <div key={idx}>
                  <label>{field.field_name}</label>
                  <Linkify componentDecorator={componentDecorator}>
                    <p>{field.value}</p>
                  </Linkify>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
      <div className='viewProfile-postsContainer cmr c-profile-posts-container'>
        <div className='divider' />
        <div className='name row-fs-c cmr c-profile-posts-header'>
          <div
            onClick={() => setTab('posts')}
            className='cursor-pointer hover:text-gray-600'
            style={{
              borderBottom:
                tab === 'posts' ? '3px solid #189ffd' : '3px solid transparent',
              marginRight: 20,
              cursor: 'pointer'
            }}
          >
            Posts
          </div>
          <div
            onClick={() => setTab('comments')}
            className='cursor-pointer hover:text-gray-600'
            style={{
              borderBottom:
                tab === 'comments'
                  ? '3px solid #189ffd'
                  : '3px solid transparent'
            }}
          >
            Comments
          </div>
        </div>
        {tab === 'posts' && person.posts.length === 0 && (
          <div>No Posts Yet!</div>
        )}
        {tab === 'comments' && person.comments.length === 0 && (
          <div>No Comments Yet!</div>
        )}
        {tab === 'posts' &&
          person.posts.map((post, idx) => (
            <PostCard
              track={globals.track}
              key={idx}
              post={post}
              authRequired={globals.authRequired}
            />
          ))}
        {tab === 'comments' &&
          person.comments.map((comment, idx) => (
            <div
              className='shadow-md bg-white border border-gray-500 rounded-lg p-5 mb-5 cursor-pointer hover:border-blue-500'
              onClick={() =>
                router.push(`/post/[id]`, `/post/${comment.post.id}`)
              }
            >
              <div className='font-bold'>{comment.post.title}:</div>
              <div
                className='cmr c-profile-comment-content'
                dangerouslySetInnerHTML={{
                  __html: comment.content
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

Profile.getInitialProps = async function (ctx) {
  return await initialPropsHelper(ctx, `_person/${ctx.query.id}`, '_person');
};

export default Profile;
