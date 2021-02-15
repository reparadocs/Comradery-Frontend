import { useState, useEffect, useRef } from 'react';
import Router, { useRouter } from 'next/router';
import { ChevronDown } from 'react-feather';

function ChannelSelector({ channels }) {
  const [open, setOpen] = useState(false);
  const [channelName, setChannelName] = useState('All Posts');
  const [channelEmoji, setChannelEmoji] = useState('🗄️');
  const router = useRouter();
  const { channel } = router.query;

  useEffect(() => {
    if (channel) {
      const channelID = parseInt(channel);

      for (var c of channels) {
        if (c.id === channelID) {
          setChannelName(c.name);
          setChannelEmoji(c.emoji);
          return;
        }
      }
    } else {
      setChannelName('All Posts');
      setChannelEmoji('🗄️');
    }
  }, [channel]);

  return (
    <div
      className='relative flex outline-none'
      onBlur={() =>
        setTimeout(() => {
          if (open) {
            setOpen(false);
          }
        }, 200)
      }
      tabIndex={0}
    >
      <div
        className='cursor-pointer relative text-center'
        style={{ width: '100%' }}
        onClick={() => {
          setOpen((open) => !open);
        }}
      >
        <h1
          style={{ fontSize: '5vw ' }}
          className='flex hover:text-gray-600 flex-row justify-center items-center'
        >
          {channelEmoji} {channelName}{' '}
          <ChevronDown size={20} className='ml-1' />
        </h1>
      </div>

      <div
        style={{
          opacity: open ? 1 : 0,
          maxHeight: 300,
          height: open ? 'auto' : 0,
          display: open ? 'block' : 'none',
          width: 280,
          top: 40,
          left: 0
        }}
        className='absolute rounded-lg border-solid border-2 border-gray-200 bg-white z-50 shadow-lg overflow-auto cmr c-channel-tray'
      >
        <div
          className='cursor-pointer px-4 py-3 hover:bg-gray-300'
          onClick={() => {
            router.push(`/`, `/`, { shallow: true });
            setOpen(false);
          }}
        >
          🌐 All Posts
        </div>
        {channels.map((_channel, idx) => (
          <div
            key={idx}
            className='cursor-pointer px-4 py-3 hover:bg-gray-300'
            onClick={() => {
              router.push(
                `/?channel=${_channel.id}`,
                `/?channel=${_channel.id}`,
                { shallow: true }
              );
              setOpen(false);
            }}
          >
            {_channel.emoji} {_channel.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChannelSelector;
