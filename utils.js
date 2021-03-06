import moment from 'moment';

export const API_PRODUCTION_URL = 'https://api.comradery.io/v1/';

export const API_DEV_URL = 'http://localhost:8000/v1/';

export const CHAT_PRODUCTION_URL =
  'https://comradery-spitfire.herokuapp.com/thestate';

export const CHAT_DEV_URL = 'http://localhost:8080/thestate';

export const isProduction = () => process.env.NODE_ENV === 'production';

export const getHost = (ctx = null) => {
  return typeof window === 'undefined'
    ? ctx.req.headers.host.toLowerCase()
    : window.location.host.toLowerCase();
};

export const getSubdomain = (ctx = null) => {
  return typeof window === 'undefined'
    ? ctx.req.headers.host.split('.')[0].toLowerCase()
    : window.location.host.split('.')[0].toLowerCase();
};

export const searchIndexName = (index_name = 'post') => {
  const prefix = isProduction() ? 'prod_' : 'dev_';
  return prefix + index_name + '_index';
};

export const generateColor = (str) => {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var h = hash % 360;
  return 'hsl(' + h + ', ' + 50 + '%, ' + 60 + '%)';
};

export const capitalize = (s) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const isUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const getSegmentUserId = (person) => {
  if (!person) return null;
  return 'segment_user_id' in person && person.segment_user_id
    ? person.segment_user_id
    : person.id;
};

const segmentFetch = (path, body, writeKey) => {
  fetch('https://api.segment.io/v1/' + path, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(writeKey + ':'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      Object.assign({}, body, {
        timestamp: Date.now(),
        context: {
          integration: {
            name: 'comradery',
            version: '1.0.0'
          }
        }
      })
    )
  });
};

export const analyticsPage = (
  name,
  anon_id,
  user_id,
  writeKey,
  trackAnonymous
) => {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.page(name);
  }

  if (user_id || trackAnonymous) {
    if (writeKey) {
      let body = {
        properties: {
          url: typeof window !== 'undefined' ? window.location.href : null
        },
        name,
        anonymousId: anon_id
      };

      if (user_id) {
        body['userId'] = user_id;
      }

      segmentFetch('page', body, writeKey);
    }
  }
};

export const analyticsIdentify = (id, traits, customerUserId, writeKey) => {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.identify(id, traits);
  }

  if (writeKey) {
    let body = {
      userId: customerUserId,
      traits: traits
    };

    segmentFetch('identify', body, writeKey);
  }
};

export const analyticsTrack = (
  event,
  properties,
  anon_id,
  user_id,
  writeKey,
  trackAnonymous
) => {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(event, properties);
  }

  if (user_id || trackAnonymous) {
    if (writeKey) {
      let body = {
        event: event,
        properties: properties,
        anonymousId: anon_id
      };

      if (user_id) {
        body['user_id'] = user_id;
      }

      segmentFetch('track', body, writeKey);
    }
  }
};

export const dataURItoBlob = (dataURI, type) => {
  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: type });
};

export const chatRoomNamePerson = (room, self) => {
  if (room.room_type === 'room') {
    return [room.name, null];
  } else if (room.room_type === 'direct') {
    if (!self) {
      return [null, null];
    }
    for (let i = 0; i < room.members.length; i++) {
      if (room.members[i].id !== self.id) {
        return [room.members[i].username, room.members[i]];
      }
    }
    return [null, null];
  }
};

export const relativeTime = (time) => {
  let mom = moment(time);
  let today = moment();
  let over_a_day = today.clone().subtract(1, 'days');
  let over_a_week = today.clone().subtract(7, 'days');

  if (mom.isBefore(over_a_week)) {
    return mom.format('MMM D');
  }

  if (mom.isBefore(over_a_day)) {
    return mom.format('ddd');
  }

  return mom.format('LT');
};
