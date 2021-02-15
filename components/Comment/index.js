import moment from 'moment';
import React, { useState } from 'react';
import '../../style.css';
import CommentEditor from '../CommentEditor';
import Voter from '../Voter';
import ProfileLink from '../ProfileLink';
import UserPhoto from '../UserPhoto';
import { Bullet } from '../Common';
import ApiClient from '../../ApiClient';
import ConfirmModal from '../ConfirmModal';
import { MessageCircle } from 'react-feather';

let cn = require('classnames');

function Comment({ comment, post, level, authRequired, track, refreshPost }) {
  const [reply, setReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const [children, setChildren] = useState(comment.children);
  const [owner, setOwner] = useState(comment.owner);
  const [content, setContent] = useState(comment.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const MAX_LEVEL = 6;

  const child_comments =
    level < MAX_LEVEL && !!children.length ? (
      <div
        className={
          (level % 2 ? 'light ' : '') +
          'commentChild cmr c-child-comment-container'
        }
      >
        {children.map((comment) => (
          <Comment
            refreshPost={refreshPost}
            track={track}
            authRequired={authRequired}
            key={comment.id}
            comment={comment}
            post={post}
            level={level + 1}
          />
        ))}
      </div>
    ) : null;

  return (
    <div className={cn([{'hasChildren': !!child_comments}, 'com', 'cmr', 'c-comment-container-1'])}>
      <div className='com--left col-fs-c'>
        <UserPhoto
          person={owner}
          size={28}
          className='com--userPhoto c-comment-author-photo profilePhoto '
        />
        <div className='com--border' />
      </div>
      <div className='com--right col'>
        <div className='com--top col'>
          <ProfileLink
            track={track}
            profile={owner}
            className='com--name cmr c-comment-author-link'
          />
          <span className='com--time'>{moment(comment.posted).fromNow()}</span>
        </div>
        {editing ? (
          <div>
            <CommentEditor
              track={track}
              level={level}
              post={post}
              authRequired={authRequired}
              comment={comment}
              additionalActions={
                <div
                  className='text-red-600 mr-2 cursor-pointer hover:text-red-800 cmr c-comment-delete-button'
                  onClick={() => {
                    setShowDeleteConfirm(true);
                  }}
                >
                  Delete
                </div>
              }
              editing={true}
              initValue={content}
              onCancel={() => setEditing(false)}
              onSubmit={(data) => {
                setEditing(false);
                setContent(data.content);
              }}
            />
            <ConfirmModal
              isDelete={true}
              show={showDeleteConfirm}
              onHide={() => setShowDeleteConfirm(false)}
              title='Delete Comment'
              path={`comment/${comment.id}`}
              onSuccess={(data) => {
                setEditing(false);

                if (data.id) {
                  setOwner(data.owner);
                  setChildren(data.children);
                  setContent(data.content);
                } else {
                  refreshPost();
                }
              }}
            >
              This comment will be irreversably deleted. Are you sure you want
              to delete this comment?
            </ConfirmModal>
          </div>
        ) : (
          <div
            className='com--text format-content cmr c-comment-content'
            dangerouslySetInnerHTML={{
              __html: content
            }}
          />
        )}
        {reply && (
          <CommentEditor
            track={track}
            authRequired={authRequired}
            level={level}
            post={post}
            comment={comment}
            onCancel={() => setReply(false)}
            onSubmit={(data) => {
              setReply(false);
              setChildren([data].concat(children));
            }}
          />
        )}
        {!reply && !editing && (
          <div className='commentFooter text-xs text-gray-600 font-bold row-fs-c cmr c-comment-footer'>
            <Voter
              track={track}
              iconSize={15}
              obj={comment}
              objName='comment'
              authRequired={authRequired}
            />
            <div style={{width: 8}} />
            {level < MAX_LEVEL - 1 && (
              <div className='flex flex-row items-center cmr c-comment-reply-container'>
                <div
                  className='com--reply row-c-c cmr c-comment-reply'
                  onClick={() => {
                    if (authRequired()) {
                      setReply(true);
                    }
                  }}
                >
                  <span>Reply</span>
                  <MessageCircle size={12} />
                </div>
              </div>
            )}
            {comment.editable && (
              <div className='flex flex-row items-center cmr c-comment-edit-delete-container'>
                <Bullet className='mx-2' />
                <div
                  onClick={() => setEditing(true)}
                  className='hover:text-gray-900 cursor-pointer cmr c-comment-edit'
                >
                  Edit
                </div>
              </div>
            )}
          </div>
        )}
        <div className='commentMargin'>{child_comments}</div>
      </div>
    </div>
  );
}

export default Comment;
