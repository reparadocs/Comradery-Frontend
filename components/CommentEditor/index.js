import React, { useState, useRef, useEffect } from 'react';
import ApiClient from '../../ApiClient';
import XButton from '../XButton';
import ErrorMessage from '../ErrorMessage';

const Editor =
  typeof window !== 'undefined' ? require('../XQuillEditor').default : false;

function CommentEditor({
  post,
  comment,
  onSubmit,
  level,
  additionalActions,
  onCancel,
  editing,
  initValue,
  authRequired,
  track,
  autofocus = true
}) {
  const [content, setContent] = useState(initValue ? initValue : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const editorRef = useRef(null);

  const validate = (values) => {
    return { error: false, values };
  };

  useEffect(() => {
    if (autofocus && editorRef) {
      editorRef.current.focus();
    }
  }, [editorRef, autofocus]);

  const handleSubmit = () => {
    track('New Comment Submitted', {
      post_title: post.title,
      post_id: post.id,
      parent_comment_id: comment ? comment.id : null
    });
    if (authRequired()) {
      setError(null);
      setLoading(true);
      const { error } = ApiClient.post(
        editing ? `comment/${comment.id}` : `post/${post.id}/comment`,
        {
          content: content,
          parent: comment && !editing ? comment.id : null
        },
        {
          validate,
          onError: () => setError(true),
          onReturn: () => setLoading(false),
          onSuccess: (data) => {
            if (onSubmit) {
              onSubmit(data);
            }
            setContent('');
          }
        }
      );
      setError(error);
    }
  };

  return (
    <div className='commentEditor cmr c-comment-editor-container'>
      <div
        className={
          (level && level % 2 ? 'light ' : '') +
          'commentEditor-editor cmr c-comment-editor'
        }
      >
        <Editor value={content} ref={editorRef} onChange={setContent} />
      </div>
      <div className='commentEditor-footer row-fs-c cmr c-comment-editor-footer-1'>
        <ErrorMessage error={error} pill />
        {onCancel && (
          <div
            className='mr-2 text-gray-600 cursor-pointer'
            onClick={() => onCancel()}
          >
            Cancel
          </div>
        )}
        {additionalActions}
        <XButton
          onClick={handleSubmit}
          loading={loading}
          className='footer-btn cmr c-post-comment-button'
        >
          Post
        </XButton>
      </div>
    </div>
  );
}

export default CommentEditor;
