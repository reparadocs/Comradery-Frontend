import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import ApiClient from '../ApiClient';
import XButton from '../components/XButton';
import Dropdown from '../components/Dropdown';
import ErrorMessage from '../components/ErrorMessage';
import { PageHeader, Label, BackButton } from '../components/Common';
import PostEditor from '../components/PostEditor';
import BackLink from '../components/BackLink';
import Notifications from '../components/notifications/Notifications';
import Nav from '../components/Nav';

function NewPost({ globals, refreshData }) {
  useEffect(() => {
    globals.setTab('posts');
  }, []);

  return (
    <div className='editPostContainer pc-container'>
      <PageHeader title='New Post' />
      <div className='pHead row-sb-c'>
        <BackButton href={`/`} globals={globals} />

        <Nav
          globals={globals}
          refreshData={refreshData}
          className='pHead--nav'
        ></Nav>
      </div>
      <div className='feedNav wide row-fs-c'>
        <h1>New Post</h1>
      </div>
      <div className='editPostContainer-inner cmr c-new-post-container'>
        <PostEditor
          onSubmit={(post) =>
            globals.track('New Post Submitted', {
              title: post.title,
              channel: post.channel.name
            })
          }
          globals={globals}
          initialContent=''
          initialTitle=''
          postURL='post/create'
        />
      </div>
    </div>
  );
}

export default NewPost;
