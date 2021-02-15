import moment from 'moment';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Edit3, TrendingUp, TrendingDown, Star } from 'react-feather';
import ApiClient, { initialPropsHelper } from '../../ApiClient';
import Comment from '../../components/Comment';
import CommentEditor from '../../components/CommentEditor';
import Layout from '../../components/layout';
import Voter from '../../components/Voter';
import '../../style.css';
import ProfileLink from '../../components/ProfileLink';
import UserPhoto from '../../components/UserPhoto';
import PageLoading from '../../components/PageLoading';
import ContentAttachments from '../../components/ContentAttachments';
import { MessageCircle } from 'react-feather';
import {
  EditButton,
  PageHeader,
  BackButton,
  TitleComponent
} from '../../components/Common';
import ChannelLink from '../../components/ChannelLink';
import PostCard from '../../components/PostCard';
import Notifications from '../../components/notifications/Notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import Nav from '../../components/Nav';

let cn = require('classnames');

const EditPostContainer = ({ post, children, globals }) => (
  <Link href='/edit_post/[id]' as={`/edit_post/${post.id}`}>
    <div
      className='outline-none cursor-pointer'
      onClick={() =>
        globals.track('Post - Edit Post Clicked', {
          id: post.id,
          title: post.title
        })
      }
    >
      {children}
    </div>
  </Link>
);

function Post({ globals, initialPost, query, embed, refreshData }) {
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(initialPost ? false : true);

  const refreshPost = (id) => {
    setLoading(true);
    ApiClient.get(`post/${id}`, {
      onReturn: () => setLoading(false),
      onError: () => globals.pageError(),
      onSuccess: (data) => {
        setPost(data);
      }
    });
  };

  useEffect(() => {
    globals.setTab('posts');

    if (!initialPost) {
      refreshPost(query.id);
    }
  }, []);

  useEffect(() => {
    if (post && query.id !== post.id) {
      refreshPost(query.id);
    }
  }, [query]);

  if (loading || !post) return <PageLoading />;
  return (
    <div className='postPage col pc-container'>
      <PageHeader title={`${post.title}`} />
      {embed ? (
        <div className='w-full h-4' />
      ) : (
        <div className='pHead row-sb-c'>
          <BackButton href={`/`} globals={globals} />
          <div className='row-fs-c'>
            {post.editable && (
              <EditPostContainer post={post} globals={globals}>
                <EditButton />
              </EditPostContainer>
            )}
            <Nav
              globals={globals}
              refreshData={refreshData}
              className='pHead--nav'
            ></Nav>
          </div>
        </div>
      )}
      <div className='pc onPostPage'>
        <section className='pc--title row-sb-c'>
          <span>{post.title}</span>
          <div className='row-fs-c'>
            {globals.self && globals.self.admin && (
              <div
                className={cn(['pc--pinBtn row-c-c', { pinned: post.pinned }])}
                onClick={() => {
                  ApiClient.post(`post/${post.id}/pin`, {
                    pinned: !post.pinned
                  });
                  setPost({ ...post, pinned: !post.pinned });
                }}
              >
                <span>{post.pinned ? 'Unpin' : 'Pin'}</span>
                <FontAwesomeIcon icon={faThumbtack} size={16} />
              </div>
            )}
          </div>
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
          {post.owner ? (
            <Link href={`/profile/[id]`} as={`/profile/${post.owner.id}`}>
              <div
                className='left row-fs-c'
                onClick={() =>
                  globals.track('Post Author Clicked', {
                    post_id: post.id,
                    username: post.owner.username,
                    user_id: post.owner.id
                  })
                }
              >
                <UserPhoto
                  size={28}
                  person={post.owner}
                  className='pc--userPhoto'
                />
                <div className='col'>
                  <span className='pc--name'>{post.owner.username}</span>
                  <span className='pc--time'>
                    {moment(post.posted).fromNow()}
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className='left row-fs-c cmr c-post-author-deleted'>
              [deleted]
            </div>
          )}
          <div className='right row-fs-c'>
            {typeof post.views !== 'undefined' && (
              <span className='pc--views'>{post.views + ' views'}</span>
            )}
            <div className='row-fs-c'>
              <div className='pc--comments row-fs-c'>
                {post.comments.length}
                <MessageCircle size={12} />
              </div>
              <Voter
                track={globals.track}
                obj={post}
                objName='post'
                className='pc--likes'
                authRequired={globals.authRequired}
              />
            </div>
          </div>
        </section>
      </div>

      <div className='commentEditorContainer'>
        <CommentEditor
          track={globals.track}
          autofocus={false}
          post={post}
          authRequired={globals.authRequired}
          onSubmit={(data) => {
            let _comments = [...post.comments];
            _comments.unshift(data);
            setPost({ ...post, comments: _comments });
          }}
        />
      </div>
      <div className='commentPortion cmr c-post-comments-container'>
        {post.comments.map((comment, idx) => (
          <div className='commentContainer' key={comment.id}>
            <Comment
              track={globals.track}
              authRequired={globals.authRequired}
              comment={comment}
              refreshPost={() => refreshPost(post.id)}
              post={post}
              level={0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

Post.getInitialProps = async function (ctx) {
  return initialPropsHelper(ctx, `post/${ctx.query.id}`, 'initialPost');
};

export default Post;
