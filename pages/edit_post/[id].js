import React, { useState, useEffect } from 'react';
import ApiClient, { initialPropsHelper } from '../../ApiClient';
import PageLoading from '../../components/PageLoading';
import { PageHeader, BackButton, EditButton } from '../../components/Common';
import PostEditor from '../../components/PostEditor';
import XButton from '../../components/XButton';
import BackLink from '../../components/BackLink';
import { useRouter } from 'next/router';
import Notifications from '../../components/notifications/Notifications';
import Nav from '../../components/Nav';
import ConfirmModal from '../../components/ConfirmModal';

function EditPost({ globals, _post, query, refreshData }) {
  const [post, setPost] = useState(_post);
  const [loading, setLoading] = useState(_post ? false : true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    globals.setTab('posts');
    if (!_post) {
      ApiClient.get(`post/${query.id}`, {
        onReturn: () => setLoading(false),
        onError: () => globals.pageError(),
        onSuccess: (data) => {
          setPost(data);
        }
      });
    }
  }, []);

  if (loading || !post) return <PageLoading />;

  const deletePost = (
    <div>
      <XButton
        variant='warning'
        className='mr-2 cmr c-delete-post-confirm-button'
        onClick={() => {
          globals.track('Delete Post Clicked', {
            title: post.title,
            id: post.id
          });
          setShowDeleteConfirm(true);
        }}
      >
        Delete Post
      </XButton>
      <ConfirmModal
        isDelete={true}
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        title='Delete Post?'
        path={`post/${post.id}`}
        onSuccess={(data) => {
          globals.track('Delete Post Confirmed', {
            title: post.title,
            id: post.id
          });
          router.push(`/`);
        }}
      >
        This post will be irreversably deleted. Are you sure you want to delete
        this post: {post.title}?
      </ConfirmModal>
    </div>
  );

  return (
    <div className='editPostContainer cmr c-edit-post-container pc-container'>
      <PageHeader title={`Edit Post: ${post.title}`} />
      <div className='pHead row-sb-c'>
        <BackButton
          href={`/post/[id]`}
          as={`/post/${query.id}`}
          globals={globals}
        />

        <Nav
          globals={globals}
          refreshData={refreshData}
          className='ml-auto pHead--nav'
        ></Nav>
      </div>
      <div className='feedNav wide row-fs-c'>
        <h1>Edit Post</h1>
      </div>
      <div className='editPostContainer-inner cmr c-edit-post-container'>
        <PostEditor
          onSubmit={(_post) =>
            globals.track('Edit Post Submitted', {
              title: _post.title,
              id: _post.id,
              channel: post.channel.name
            })
          }
          globals={globals}
          initialChannel={post.channel}
          initialContent={post.content}
          initialTitle={post.title}
          postURL={`post/${post.id}`}
          additionalActions={deletePost}
        />
      </div>
    </div>
  );
}

EditPost.getInitialProps = async function (ctx) {
  return await initialPropsHelper(ctx, `post/${ctx.query.id}`, '_post');
};

export default EditPost;
