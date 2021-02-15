let cn = require('classnames');
import { useState, useEffect } from 'react';
import { NumericMenu } from 'react-instantsearch-dom';
import UserPhoto from '../UserPhoto';
import Chat from '../icons/Chat';
import { Settings } from 'react-feather';

const ShowAllSelector = ({ state, onToggle }) => (
  <div onClick={onToggle} className='sb--showMore row-fs-c'>
    <span>{state ? 'Show less' : 'Show all'}</span>
    <img alt='arrow' className={cn({ flip: state })} src='/down_arrow.svg' />
  </div>
);

export const ChatOnlineIndicator = ({ online }) => (
  <div className='sbm-onlineChatIndicator ml-auto row-fe-c'>
    {online > 1 && <span>{online}</span>}
    <div className={online > 0 ? 'online' : 'offline'} />
  </div>
);

export const ChatIcon = ({ selected, person }) => {
  if (person) {
    return <UserPhoto person={person} size={20} />;
  }
  return <Chat color='rgba(32,59,84,1)' />;
};

export const ChatUnreadsOrOnlineCount = ({ unread, selected }) => {
  if (unread && !selected) {
    return (
      <div className='sb--chatUnreads'>
        <div className='unread'>{unread}</div>
      </div>
    );
  } else {
    return null;
    //return <ChatOnlineIndicator />
  }
};

export const SidebarRow = ({ self, children, icon, onClick, active }) => {
  return (
    <div
      className={cn([
        'sbm-sectionItem',
        'row-sb-c',
        {
          active: active
        },
        'cmr',
        {
          'c-unselected-channel': !active,
          'c-selected-channel': active
        }
      ])}
      onClick={onClick}
    >
      <div className='sbm-sectionItem-left row-fs-c w-full'>
        <div className='sbm-sectionItem-leftIcon col-c'>
          {icon && React.cloneElement(icon, { selected: active })}
        </div>
        {children}
      </div>
    </div>
  );
};

export const SectionItem = ({ children, className, active, icon, onClick }) => (
  <li
    className={cn(['sb--item', 'row-fs-c', className, { active: active }])}
    onClick={onClick}
  >
    <div className='icon col-c-c'>{icon}</div>
    {children}
  </li>
);

export const SidebarSection = ({
  children,
  label,
  maxVH,
  style,
  className
}) => {
  const getVh = () =>
      Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
    [show, setShow] = useState(false),
    [vh, setVh] = useState(getVh()),
    onWindowResize = () => setVh(getVh());

  useEffect(() => {
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, []);

  const numOfElementsToShow = Math.floor(
    ((vh || 500) * ((maxVH || 100) / 100)) / 28
  );
  return (
    <div className={cn(['sb--section col', className])} style={style}>
      {label}
      <div className='col section_inner'>
        {React.Children.map(children, (child, index) => (
          <div
            className={cn([
              'sb-item-container',
              { showing: show || index < numOfElementsToShow }
            ])}
          >
            {child}
          </div>
        ))}
        {children && children.length > numOfElementsToShow ? (
          <ShowAllSelector
            onToggle={() => setShow((show) => !show)}
            state={show}
          />
        ) : null}
      </div>
    </div>
  );
};
