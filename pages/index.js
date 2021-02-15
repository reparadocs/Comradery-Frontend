import React, { useState, useEffect, useRef } from 'react';
import ApiClient, { initialPropsHelper } from '../ApiClient.js';
import Layout from '../components/layout';
import PostCard from '../components/PostCard';
import '../style.css';
import { getHost, getSubdomain } from '../utils';
import XButton from '../components/XButton';
import Link from 'next/link';
import Loader from 'react-loader-spinner';
import { useRouter } from 'next/router';
import { PageHeader, TitleComponent } from '../components/Common';
import {
  ArrowRightCircle,
  ChevronRight,
  Plus,
  Lock,
  Link as LinkIcon
} from 'react-feather';
import AccountDropdown from '../components/AccountDropdown';
import ErrorMessage from '../components/ErrorMessage';
import { parseCookies, setCookie, destroyCookie } from 'nookies';
import Dropdown from '../components/Dropdown';
import InfiniteScroll from '../components/InfiniteScroll.js';
import Notifications from '../components/notifications/Notifications';
import ChannelSelector from '../components/ChannelSelector.js';
import Nav from '../components/Nav';
import Private from '../components/icons/Private.js';

function Home({ _posts, globals, refreshData }) {
  const [channelIndex, setChannelIndex] = useState(-1);
  const [posts, setPosts] = useState(_posts ? _posts.data : null);
  const [loading, setLoading] = useState(_posts ? false : true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState('trending');
  const dataPath = `community/${getHost()}/posts`;
  const [sortTime, setSortTime] = useState('week');
  const [path, setPath] = useState(dataPath);
  const [hasNext, setHasNext] = useState(_posts ? _posts.has_next : false);
  const router = useRouter();
  const { channel, token } = router.query;

  useEffect(() => {
    globals.setTab('posts');

    if (!_posts && !channel) {
      filterPosts({ _channel: -1 });
    }
  }, []);

  useEffect(() => {
    if (globals.community && channel) {
      for (let i = 0; i < globals.community.channels.length; i++) {
        let channelID = parseInt(channel);
        if (globals.community.channels[i].id === channelID) {
          filterPosts({ _channel: i });
          break;
        }
      }
    }
    if (globals.community && !channel && channelIndex !== -1) {
      filterPosts({ _channel: -1 });
    }
  }, [globals.community, channel]);

  const filterPosts = ({ _channel = null, _sort = null }) => {
    if (_sort === null) {
      _sort = sort;
    }

    if (_channel === null) {
      _channel = channelIndex;
    }

    if (_channel === channelIndex && sort === _sort && posts) return;

    setSort(_sort);
    setChannelIndex(_channel);
    setError(false);
    setLoading(true);
    setHasNext(false);

    let href = '/';
    let path = dataPath;
    let query = [];

    if (_channel >= 0) {
      let channelID = globals.community.channels[_channel].id;

      href = '/?channel=' + channelID;
      query.push('channel=' + channelID);
    }

    if (router.asPath !== href) {
      router.push(href, href, { shallow: true });
    }

    query.push('sort=' + _sort);

    if (query.length > 0) {
      path += '?' + query.join('&');
    }

    setPath(path);

    ApiClient.get(path, {
      onSuccess: (data) => {
        setPosts(data.data);
        setHasNext(data.has_next);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
        setError(true);
      }
    });
  };

  const sortBy = (
    <div className='row-fs-c feedNav-sort on_desktop'>
      <div>Sort by &nbsp;</div>
      <div className='sortField--drop'>
        <Dropdown
          className='cmr c-sort-by-dropdown'
          iconClassName='w-4 h-4'
          optionsClassName='w-32'
          value={sort.split('&')[0]}
          options={['trending', 'top', 'new']}
          onChange={(val) => {
            globals.track('Home - Sort By Changed', { sort_by: val });
            if (val === 'top') {
              val += '&time=' + sortTime;
            }
            filterPosts({ _sort: val });
          }}
        />
      </div>

      {sort.includes('top') && (
        <div className='sortField--drop flex flex-row items-center'>
          <div className='whitespace-no-wrap'>&nbsp;in the last &nbsp;</div>
          <Dropdown
            className='cmr-sort-by-time-dropdown'
            iconClassName='w-4 h-4'
            optionsClassName='w-32'
            value={sortTime}
            options={['day', 'week', 'month', 'year', 'all']}
            onChange={(val) => {
              globals.track('Home - Sort By Top Time Range Changed', {
                time_range: val
              });
              setSortTime(val);
              filterPosts({ _sort: 'top&time=' + val });
            }}
          />
        </div>
      )}
    </div>
  );

  const currentChannel = globals.community.channels[channelIndex];
  return (
    <div style={{ minHeight: 400 }}>
      <InfiniteScroll
        className='col cmr c-home-container-1 h-full'
        key={path}
        useWindowScroll={true}
        path={path}
        onDataLoad={(data) => {
          setPosts((posts) => [...posts, ...data]);
        }}
        initialHasNext={hasNext}
        tolerance={600}
      >
        <PageHeader
          title={
            globals.community ? `${globals.community.display_name}` : 'Home'
          }
        />

        <div className='pHead feedNav row-sb-c indexChannels items-center'>
          <h1 className='hidden md:flex feedNav-mr items-center flex-row indexChannels'>
            <span className='channelEmoji'>
              {channelIndex > -1 ? (
                currentChannel.private ? (
                  <Private invert size={18} containerSize={36} />
                ) : (
                  currentChannel.emoji
                )
              ) : (
                '🗄'
              )}
            </span>
            &nbsp;
            {channelIndex > -1 ? currentChannel.name : 'All Posts'}
          </h1>
          <div className='feedNav-sort row-fs-c cmr c-home-sort-by'>
            <div className='channelSelector'>
              <ChannelSelector channels={globals.community.channels} />
            </div>
            <div className='hidden md:block'>{sortBy}</div>
            <Nav
              globals={globals}
              refreshData={refreshData}
              className='ml-auto pHead--nav'
            ></Nav>
          </div>
        </div>

        <div
          style={{
            paddingRight: 16,
            paddingLeft: 16,
            fontSize: 12,
            marginBottom: 16
          }}
          className='w-full flex flex-row justify-between items-center block md:hidden'
        >
          <div>{sortBy}</div>
          <Link href='/new_post' as='/new_post'>
            <div>
              <XButton
                style={{ paddingRight: '0.5em', paddingLeft: '0.5em' }}
                className='w-full shadow-md cmr c-new-post-button'
                onClick={() => {
                  globals.track('Home - New Post Clicked', {});
                  if (globals.authRequired()) {
                    router.push('/new_post');
                  }
                }}
              >
                New Post
              </XButton>
            </div>
          </Link>
        </div>
        {error && (
          <div className='flex items-center justify-center h-full w-full'>
            <ErrorMessage />
          </div>
        )}
        {!error &&
          (posts && !loading ? (
            <div className='pc-container'>
              <div
                className='pc-composerPlaceholder row-fs-c'
                onClick={() => {
                  globals.track('Home - New Post Clicked', {});
                  if (globals.authRequired()) {
                    router.push('/new_post');
                  }
                }}
              >
                Type a new post....
              </div>
              {posts.map((post, idx) => (
                <PostCard
                  track={globals.track}
                  key={idx}
                  post={post}
                  authRequired={globals.authRequired}
                />
              ))}
            </div>
          ) : (
            <div className='h-full w-full mt-20 flex items-center justify-center'>
              <Loader type='Oval' color='black' height={40} width={40} />
            </div>
          ))}
      </InfiniteScroll>
    </div>
  );
}

Home.getInitialProps = async function (ctx) {
  if (ctx.query.channel) {
    return { _posts: null };
  }

  if (ctx.query.token) {
    if (parseCookies(ctx)[getSubdomain(ctx)] !== ctx.query.token) {
      setCookie(ctx, getSubdomain(ctx), ctx.query.token, {
        path: '/',
        expires: new Date('Sat, 22 Feb 2030 06:06:24 GMT')
      });
      return { _posts: null, query: ctx.query };
    }
  }

  return await initialPropsHelper(
    ctx,
    `community/${getHost(ctx)}/posts`,
    '_posts'
  );
};

export default Home;
