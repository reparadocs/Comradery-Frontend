import Link from 'next/link';
import UserPhoto from '../UserPhoto';

let moment = require('moment');

const calculateLikes = (notification) => {
  let obj;
  if (notification.target_comment) {
    obj = notification.target_comment;
  }
  if (notification.target_post) {
    obj = notification.target_post;
  }

  if (obj.points > 2) {
    return ` & ${obj.points - 2} other${obj.points - 2 === 1 ? '' : 's'}`;
  }
  return '';
};

const getNotificationText = (notification) => {
  let content = notification.action_taker.username;
  switch (notification.notification_type) {
    case 'post_like':
      content += calculateLikes(notification) + ' liked your post!';
      break;
    case 'comment_like':
      content += calculateLikes(notification) + ' liked your comment!';
      break;
    case 'post_comment':
      content += ' commented on your post!';
      break;
    case 'comment_comment':
      content += ' responded to your comment!';
      break;
  }
  return content;
};

const NotificationLink = ({ notification, children }) => {
  let post_id;
  if (notification.target_comment) {
    post_id = notification.target_comment.post;
  } else if (notification.target_post) {
    post_id = notification.target_post.id;
  }
  return (
    <Link href={`/post/[id]`} as={`/post/${post_id}`}>
      {children}
    </Link>
  );
};

function NotificationCard({ notification, closeTray }) {
  return (
    <NotificationLink notification={notification}>
      <div
        onClick={() => closeTray()}
        style={{
          width: '100%',
          boxShadow: '0 1px 0 0 rgba(0,0,0,.05)',
          opacity: notification.read ? 0.75 : 1
        }}
        className='p-4 relative pl-8 text-sm hover:bg-gray-100 cursor-pointer select-none cmr c-notif-card'
      >
        <div
          className='rounded-full absolute bg-blue-400 mt-4 cmr c-notif-card-unreadmarker'
          style={{
            height: 6,
            width: 6,
            left: 10,
            opacity: notification.read ? 0 : 1
          }}
        />
        <span className='text-gray-600 cmr c-notif-card-maintext'>
          {getNotificationText(notification)}
        </span>
        <div
          style={{ width: '100%', marginTop: 6 }}
          className='flex flex-row justify-between items-center'
        >
          <UserPhoto person={notification.action_taker} size={16} />

          <span className='text-gray-500 text-xs cmr c-notif-card-timestamp'>
            {moment(notification.time).fromNow()}
          </span>
        </div>
      </div>
    </NotificationLink>
  );
}

export default NotificationCard;
