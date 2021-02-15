import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import ApiClient from '../../ApiClient';
import XButton from '../XButton';
import Dropdown from '../Dropdown';
import ErrorMessage from '../ErrorMessage';
import { PageTitle, Label } from '../Common';
import XInput from '../XInput';

const Editor =
  typeof window !== 'undefined' ? require('../XQuillEditor').default : false;

function PostEditor({
  globals,
  initialContent,
  initialTitle,
  initialChannel,
  postURL,
  onSubmit,
  additionalActions
}) {
  const [error, setError] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState(initialChannel);
  const router = useRouter();

  const validate = (values) => {
    if (values.title.length > 100) {
      return { error: 'Title too long' };
    }

    if (values.title.length < 5) {
      return { error: 'Title too short' };
    }

    return { error: false, values };
  };

  const handleSubmit = () => {
    setError(false);

    const post = { title, content, channel: channel.id };

    onSubmit(post);
    if (globals.authRequired()) {
      setLoading(true);
      const { error } = ApiClient.post(postURL, post, {
        validate,
        onReturn: () => setLoading(false),
        onSuccess: (data) => router.push(`/post/[id]`, `/post/${data.id}`),
        onError: () => setError(true)
      });
      setError(error);
    }
  };

  useEffect(() => {
    if (!channel && globals.community) {
      setChannel(
        globals.community.channels.filter(
          (ch) => (globals.self && globals.self.admin) || !ch.post_admin_only
        )[0]
      );
    }
  }, [globals]);

  return (
    <div className='postEditor h-full'>
      {globals.community && (
        <div>
          <Label marginTop={true}>Channel</Label>
          <Dropdown
            className='pl-6 pr-2 py-2 font-semibold bg-gray-400 hover:text-white rounded-lg hover:bg-gray-600 cmr c-new-post-dropdown'
            iconClassName='ml-2 h-6 w-6'
            optionsClassName='w-64'
            value={channel}
            options={globals.community.channels.filter(
              (ch) =>
                (globals.self && globals.self.admin) || !ch.post_admin_only
            )}
            display={(obj) => obj.emoji + ' ' + obj.name}
            onChange={(val) => {
              globals.track('New Post - Channel Changed', {
                channel: val.name
              });
              setChannel(val);
            }}
          />
        </div>
      )}
      <div className='post cmr c-post-editor-container'>
        <Label
          marginTop={true}
          optionalSecondLine='Must be less than 200 characters'
        >
          Title
        </Label>
        <XInput
          autoFocus={true}
          className='postEditor-titleInput cmr c-post-editor-title'
          value={title}
          placeholder='My excellent post'
          onChange={(e) => setTitle(e.target.value)}
        />
        <Label marginTop={true}>Content</Label>
        {Editor && (
          <Editor
            className='postEditor-contentInput'
            value={content}
            onChange={setContent}
          />
        )}
      </div>
      <div className='postEditor-footer row-sb-c cmr c-post-editor-footer-1'>
        <ErrorMessage
          error={error}
          className='ml-auto cmr c-post-editor-error'
          pill
        />

        <div className='postEditor-footer-right row-fe-c cmr c-post-editor-footer-2'>
          {additionalActions}
          <XButton className='savebtn' onClick={handleSubmit} loading={loading}>
            Save Post
          </XButton>
        </div>
      </div>
    </div>
  );
}

export default PostEditor;
