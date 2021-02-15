import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Voter from '../Voter';
import ProfileLink from '../ProfileLink';
import { Bullet } from '../Common';
import ChannelLink from '../ChannelLink';
import UserPhoto from '../UserPhoto';
import { MessageCircle, Eye, Star } from 'react-feather';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import ContentAttachments from '../../components/ContentAttachments';
let moment = require('moment'),
  cn = require('classnames');

export default ({
  children,
  post,
  authRequired,
  track,
  voter = true,
  titleComponent = null
}) => {
  let router = useRouter();
  return (
    <div
      className={
        (post.pinned ? 'pinned-postCard' : 'unpinned-postCard') +
        ' pc cmr c-post-card'
      }
      onClick={() => {
        track('Post Card Clicked', { id: post.id, title: post.title });
        router.push(`/post/[id]`, `/post/${post.id}`);
      }}
    >
      <section className='pc--title row-sb-c'>
        <span>{titleComponent ? titleComponent : post.title}</span>
        {post.pinned && (
          <div className='pc--pinIndicator row-c-c'>
            <FontAwesomeIcon icon={faThumbtack} />
            <span>Pinned</span>
          </div>
        )}
      </section>
      <section className='pc--content'>
        <div
          className='postContent format-content cmr c-post-content'
          dangerouslySetInnerHTML={{
            __html: post.content
          }}
        />
        <ContentAttachments content={post.content} />
      </section>
      <section className='pc--bottom row-sb-c'>
        <div className='left row-fs-c'>
          <UserPhoto size={28} person={post.owner} className='pc--userPhoto' />
          <div className='col'>
            <ProfileLink
              track={track}
              profile={post.owner}
              className='pc--name'
            />
            <span className='pc--time'>{moment(post.posted).fromNow()}</span>
          </div>
        </div>
        <div className='right row-fs-c'>
          {typeof post.views !== 'undefined' && (
            <span className='pc--views'>{post.views + ' views'}</span>
          )}
          <div className='row-fs-c'>
            <div className='pc--comments row-fs-c'>
              {post.num_comments}
              <MessageCircle size={12} />
            </div>
            {voter && (
              <Voter
                track={track}
                obj={post}
                votedClassName='shadow-inner'
                className='pc--likes cmr c-post-card-voter'
                objName='post'
                authRequired={authRequired}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
