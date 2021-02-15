import App from 'next/app';
import { parseCookies } from 'nookies';
import React from 'react';
import ApiClient from '../ApiClient.js';
import {
  isProduction,
  getHost,
  getSubdomain,
  analyticsPage,
  getSegmentUserId,
  analyticsIdentify,
  analyticsTrack,
  CHAT_PRODUCTION_URL,
  CHAT_DEV_URL
} from '../utils';
import AuthModal from '../components/AuthModal';
import Layout from '../components/layout';
import PageError from '../components/PageError';
import { withRouter, Router } from 'next/router';
import { setCookie } from 'nookies';
import '../public/empty.css';
import Head from 'next/head';
import PageLoading from '../components/PageLoading';
import uuidv4 from 'uuid/v4';
import '../sass/index.scss';
import { isEqual } from 'lodash';
import SockJS from 'sockjs-client';
import { TitleComponent } from '../components/Common';
import algoliasearch from 'algoliasearch/lite';
import { ToastProvider } from 'react-toast-notifications';
import OnboardingModal from '../components/OnboardingModal';

class Comradery extends App {
  constructor(props) {
    super(props);
    this.state = {
      self: null,
      community: null,
      messageCallback: null,
      authShow: false,
      communityDNE: false,
      pageError: false,
      privateError: false,
      searchClient: null,
      loading: true,
      anonymousId: '',
      inviteCodeSwitchToCreateAccount: false,
      showAuthRequiredMessage: false,
      showAuthLogin: true,
      chatRooms: [],
      selectedTab: 'posts',
      historyCount: 0,
      header: '',
      socket: null
    };

    this.refreshData = this.refreshData.bind(this);
    this.refreshCommunity = this.refreshCommunity.bind(this);
    this.authRequired = this.authRequired.bind(this);
    this.createDirectMessage = this.createDirectMessage.bind(this);
    this.socketHandshake = this.socketHandshake.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.newConn = this.newConn.bind(this);
    this.modifyChatroom = this.modifyChatroom.bind(this);
  }

  loadWebsocket = false;
  sock = null;

  newConn() {
    this.sock = new SockJS(isProduction() ? CHAT_PRODUCTION_URL : CHAT_DEV_URL);

    this.sock.onopen = () => {
      if (this.state.socket) {
        // Only reload on reconnects
        ApiClient.get(`community/${getHost()}/chatrooms`, {
          onSuccess: (data) => this.setState({ chatRooms: data })
        });
      }
      this.setState({ socket: this.sock });

      clearTimeout(this.recTimeout);

      console.log('connection opened!');
      this.socketHandshake(parseCookies()[getSubdomain()]);
      this.intervalID = setInterval(() => {
        console.log('keep alive');
        this.sock.send(JSON.stringify({ type: 'keep alive' }));
      }, 15000);
    };

    this.sock.onmessage = this.onMessage;

    this.sock.onclose = () => {
      console.log('conn closed');
      clearInterval(this.intervalID);
      if (this._ismounted) {
        this.recTimeout = setTimeout(() => {
          console.log('rec timeout');
          this.newConn();
        }, 5000);
      }
    };
  }

  refreshCommunity(_token, callback) {
    ApiClient.get(`community/${getHost()}`, {
      auth: true,
      _token,
      onError: () => this.setState({ communityDNE: true }),
      onSuccess: (data) => {
        this.setState({ community: data }, callback);
        if (data.favicon && typeof document !== 'undefined') {
          var link =
            document.querySelector("link[rel*='icon']") ||
            document.createElement('link');
          link.type = 'image/x-icon';
          link.rel = 'shortcut icon';
          link.href = data.favicon;
          document.getElementsByTagName('head')[0].appendChild(link);
        }
      }
    });
  }

  socketHandshake(token) {
    this.sock.send(
      JSON.stringify({
        type: 'handshake',
        community_url: getHost(),
        token: token
      })
    );
  }

  refreshSearchKey(_token) {
    ApiClient.get(`community/${getHost()}/search_key`, {
      auth: true,
      _token,
      onSuccess: (data) =>
        this.setState({ searchClient: algoliasearch('1Y0B9ZUMAX', data.key) })
    });
  }

  refreshChatRooms(_token) {
    const tok = _token ? _token : parseCookies({})[getSubdomain()];
    if (this.sock && this.sock.readyState === 1) {
      this.socketHandshake(tok);
    }
    ApiClient.get(`community/${getHost()}/chatrooms`, {
      auth: true,
      _token,
      onSuccess: (data) => this.setState({ chatRooms: data })
    });
  }

  refreshSelf(_token, callback) {
    ApiClient.get('self', {
      auth: true,
      _token,
      onError: () => {
        () => {
          if (callback) {
            callback();
          }
        };
      },
      onSuccess: (data) => {
        this.setState({ self: data }, callback);
        analyticsIdentify(
          data.id,
          {
            email: data.email,
            username: data.username,
            community: data.community
          },
          getSegmentUserId(data),
          this.state.community.write_key
        );
      }
    });
  }

  refreshData({ _token = null, callback = null, clear = false } = {}) {
    if (typeof window !== 'undefined' && !clear) {
      const urlParams = new URLSearchParams(window.location.search);
      if (!_token) {
        _token = urlParams.get('token');
        if (_token) {
          setCookie({}, getSubdomain(), _token, {
            path: '/',
            expires: new Date('Sat, 22 Feb 2030 06:06:24 GMT')
          });
          window.location = window.location.pathname;
        }
      }
    }
    const refreshAllData = (_callback) => {
      this.refreshCommunity(_token, () => {
        const selfCallback = () => {
          if (this.state.community.private && !this.state.self) {
            this.setState({ privateError: true });
            if (this.state.community.login_redirect) {
              const append = this.state.community.login_redirect.includes('?')
                ? '&origin=' + window.location.href
                : '?origin=' + window.location.href;

              window.location = this.state.community.login_redirect + append;
            } else {
              this.authRequired(false, true);
            }
          } else {
            this.setState({
              privateError: false,
              authShow: false
            });
            this.loadWebsocket = true;
            this.refreshSearchKey(_token);
            this.refreshChatRooms(_token);
          }
          if (_callback) {
            _callback();
          }
        };

        const token = _token ? _token : parseCookies()[getSubdomain()];
        if (token) {
          this.refreshSelf(_token, selfCallback);
        } else {
          this.setState({ self: null }, selfCallback);
        }
      });
    };

    if (clear) {
      this.setState(
        { community: null, searchClient: null, self: null, loading: true },
        refreshAllData(() => {
          if (callback) {
            callback();
          }
          this.setState({ loading: false });
        })
      );
    } else {
      refreshAllData(callback);
    }
  }

  modifyChatroom(room, updateDict, newMessage) {
    let chatrooms = [...this.state.chatRooms];
    for (var i = 0; i < chatrooms.length; i++) {
      if (chatrooms[i].id === room) {
        let roomObj = { ...chatrooms[i], ...updateDict };
        if (newMessage) {
          chatrooms.splice(i, 1);
          chatrooms = [roomObj, ...chatrooms];
        } else {
          chatrooms[i] = roomObj;
        }
        this.setState({ chatRooms: chatrooms });
        return true;
      }
    }
    return false;
  }

  onMessage(event) {
    const eventData = JSON.parse(event.data);
    let setUnread = true;
    if (
      typeof window !== 'undefined' &&
      window.location.pathname === '/chat' &&
      this.state.messageCallback
    ) {
      setUnread = !this.state.messageCallback(eventData);
    }

    const room = eventData['room'];
    let existing = this.modifyChatroom(
      room,
      {
        unread: setUnread,
        last_message: eventData
      },
      true
    );

    if (!existing) {
      ApiClient.get(`chatrooms/${room}`, {
        onSuccess: (data) =>
          this.setState({ chatRooms: [data, ...this.state.chatRooms] })
      });
    }
  }

  componentDidMount() {
    this._ismounted = true;
    this.refreshData({
      callback: () => {
        if (this.loadWebsocket) {
          this.newConn();
        }
        this.setState({ loading: false });
        let anonymousId;
        if ('s_anonymous_id' in parseCookies()) {
          anonymousId = parseCookies()['s_anonymous_id'];
        } else {
          anonymousId = uuidv4();
          setCookie({}, 's_anonymous_id', anonymousId, {
            path: '/',
            expires: new Date('Sat, 22 Feb 2030 06:06:24 GMT')
          });
        }
        this.setState({ anonymousId });
        analyticsPage(
          this.props.router.asPath,
          anonymousId,
          getSegmentUserId(this.state.self),
          this.state.community.write_key,
          this.state.community.track_anonymous
        );
        this.props.router.beforePopState(({ url, as, options }) => {
          this.setState((prevState) => ({
            historyCount: prevState.historyCount - 2
          }));
          return true;
        });
        this.props.router.events.on('routeChangeComplete', (url) => {
          if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
          }

          this.setState((prevState) => ({
            historyCount: prevState.historyCount + 1
          }));
          analyticsPage(
            url,
            anonymousId,
            getSegmentUserId(this.state.self),
            this.state.community.write_key,
            this.state.community.track_anonymous
          );
        });
      }
    });
  }

  componentWillUnmount() {
    this._ismounted = false;
    if (this.sock) {
      this.sock.close();
    }
    clearTimeout(this.recTimeout);
    clearInterval(this.intervalID);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.Component !== this.props.Component && this.state.pageError) {
      this.setState({ pageError: false });
    }
  }

  authRequired(showAuthRequiredMessage = true, showLogin = true) {
    if (this.state.self) {
      return true;
    }

    this.setState({
      showAuthLogin: showLogin,
      authShow: true,
      showAuthRequiredMessage: showAuthRequiredMessage
    });
    return false;
  }

  createDirectMessage(personId) {
    if (this.authRequired()) {
      for (let room of this.state.chatRooms) {
        if (
          room.room_type === 'direct' &&
          room.members &&
          isEqual(
            room.members.map((m) => m.id).sort(),
            [personId, this.state.self.id].sort()
          )
        ) {
          this.props.router.push(`/chat?room=${room.id}`);
          return;
        }
      }
      ApiClient.post(
        'conversations',
        {
          private_members: [personId, this.state.self.id]
        },
        {
          onSuccess: (data) => {
            this.props.router.push(`/chat?room=${data.id}`);
            this.setState({ chatRooms: [...this.state.chatRooms, data] });
          }
        }
      );
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    let globals = {
      community: this.state.community,
      self: this.state.self,
      authRequired: this.authRequired,
      createDirectMessage: this.createDirectMessage,
      onMessage: this.onMessage,
      chatRooms: this.state.chatRooms,
      searchClient: this.state.searchClient,
      historyReplace: (href, as) => {
        this.setState((prevState) => ({
          historyCount: prevState.historyCount - 1
        }));
        this.props.router.replace(href, as);
      },
      setTab: (tab) => {
        this.setState({ selectedTab: tab });
      },
      setMessageCallback: (messageCallback) => {
        this.setState({ messageCallback });
      },
      onRead: (room) => {
        this.modifyChatroom(room, { unread: false }, false);
      },
      canGoBack: () => this.state.historyCount > 0,
      pageError: () => this.setState({ pageError: true }),
      track: (event, properties) =>
        analyticsTrack(
          event,
          properties,
          this.state.anonymousId,
          getSegmentUserId(this.state.self),
          this.state.community.write_key,
          this.state.community.track_anonymous
        )
    };

    if (this.state.communityDNE) {
      return (
        <div className='bg-gray-200 h-screen w-full flex items-center justify-center'>
          <div className='text-center'>
            Community {getHost()} does not exist :( <br />
            Please check that you have the right URL!
          </div>
        </div>
      );
    }

    if (this.state.loading) {
      return <PageLoading />;
    }

    const query = this.props.router.query;
    const embed = 'embed' in query && query.embed === 'true';

    if (
      'invite_code' in query &&
      this.state.community.private &&
      !this.state.self &&
      !this.state.inviteCodeSwitchToCreateAccount
    ) {
      this.setState({ inviteCodeSwitchToCreateAccount: true }, () =>
        this.authRequired(false, false)
      );
    }

    return (
      <ToastProvider>
        <Layout
          refreshData={this.refreshData}
          refreshCommunity={this.refreshCommunity}
          globals={globals}
          embed={embed}
          chatRooms={this.state.chatRooms}
          privateError={this.state.privateError}
          selectedTab={this.state.selectedTab}
        >
          {this.state.community &&
            this.state.community.trusted &&
            this.state.community.custom_header && (
              <div
                dangerouslySetInnerHTML={{
                  __html: this.state.community.custom_header
                }}
              />
            )}
          {this.state.community && this.state.community.custom_stylesheet && (
            <Head>
              <link
                rel='stylesheet'
                href={this.state.community.custom_stylesheet}
              />
            </Head>
          )}

          <div className='cmr c-app-container-1 h-full'>
            <div className='w-auto mx-auto cmr c-app-container-2 h-full'>
              {pageProps._error ||
              this.state.pageError ||
              this.state.privateError ? (
                this.state.privateError ? (
                  <div className='bg-gray-200 h-screen w-full flex items-center justify-center cmr c-private-community-container'>
                    <div className='text-center cmr c-private-community-text'>
                      This community is private! Please{' '}
                      <span
                        onClick={() => this.authRequired(false, true)}
                        className='underline cursor-pointer'
                      >
                        login
                      </span>
                      &nbsp;to continue
                    </div>
                  </div>
                ) : (
                  <PageError />
                )
              ) : (
                <div className='h-full '>
                  <Component
                    {...pageProps}
                    embed={embed}
                    socket={this.state.socket}
                    globals={globals}
                    refreshData={this.refreshData}
                  />
                </div>
              )}
              <AuthModal
                login={this.state.showAuthLogin}
                setLogin={(login) => this.setState({ showAuthLogin: login })}
                invite_code={
                  'invite_code' in query ? query['invite_code'] : null
                }
                community={this.state.community}
                refreshData={this.refreshData}
                showAuthRequiredMessage={this.state.showAuthRequiredMessage}
                show={this.state.authShow}
                handleClose={() =>
                  this.setState({
                    authShow: false,
                    showAuthRequiredMessage: false
                  })
                }
              />
              {this.state.community && (
                <OnboardingModal community={this.state.community} />
              )}
            </div>
          </div>
        </Layout>
      </ToastProvider>
    );
  }
}

export default withRouter(Comradery);
