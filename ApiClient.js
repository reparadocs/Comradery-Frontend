import { parseCookies, setCookie, destroyCookie } from 'nookies';
import {
  isProduction,
  getSubdomain,
  API_PRODUCTION_URL,
  API_DEV_URL
} from './utils.js';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';

const BASE_URL = isProduction() ? API_PRODUCTION_URL : API_DEV_URL;

class ApiClient {
  static auth_fetch(
    path,
    args,
    {
      auth = true,
      ctx = null,
      _token = null,
      onError = null,
      onReturn = null,
      onSuccess = null
    } = {}
  ) {
    const subdomain = getSubdomain(ctx);

    if (auth) {
      const token = _token ? _token : parseCookies(ctx)[subdomain];
      if (token) {
        if ('headers' in args) {
          args['headers']['Authorization'] = 'Token ' + token;
        } else args['headers'] = { Authorization: 'Token ' + token };
      }
    }

    fetch(BASE_URL + path, args)
      .then((data) => {
        if (data.status >= 200 && data.status < 300) {
          if (onSuccess) {
            data.json().then((data) => {
              onSuccess(data);
              if (onReturn) onReturn();
            });
          }
        } else {
          if (data.status === 401) {
            data.json().then((data) => {
              if (data['detail'] === 'Invalid token.') {
                destroyCookie(ctx, subdomain, { path: '/' });
                if (typeof window !== 'undefined') {
                  window.location = window.location.pathname;
                }
              }
              if (onError) {
                onError('Authentication Error');
              }
              if (onReturn) {
                onReturn();
              }
            });
          } else if (onError) {
            data.text().then((data) => onError(data));
            if (onReturn) {
              onReturn();
            }
          }
        }
      })
      .catch((error) => {
        if (onError) {
          onError(error);
        }
        if (onReturn) {
          onReturn();
        }
      });
  }

  static async_get(path, ctx) {
    const subdomain = getSubdomain(ctx);
    const token = parseCookies(ctx)[subdomain];
    let headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = 'Token ' + token;
    }
    return fetch(BASE_URL + path, {
      headers
    }).then((data) => {
      if (data.status >= 200 && data.status < 300) {
        return Promise.resolve(data.json());
      } else {
        var error = new Error(data.statusText || data.status.toString());
        return Promise.reject(error);
      }
    });
  }

  static get(path, options = {}) {
    this.auth_fetch(
      path,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      options
    );
  }

  static delete(path, options = {}) {
    this.auth_fetch(
      path,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'DELETE'
      },
      options
    );
  }

  static post(
    path,
    data,
    {
      auth = true,
      ctx = null,
      _token = null,
      onError = null,
      onReturn = null,
      onSuccess = null,
      validate = null
    } = {}
  ) {
    let _error = false;
    if (validate) {
      var { error, values } = validate(data);
      _error = !!error;
    }

    if (!_error) {
      this.auth_fetch(
        path,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(data)
        },
        {
          auth,
          ctx,
          _token,
          onError,
          onReturn,
          onSuccess
        }
      );
      return { error: false };
    }
    if (onReturn) {
      onReturn();
    }
    return { error };
  }

  static upload_photo(path, file, field = 'photo', options = {}) {
    var data = new FormData();
    data.append(field, file);
    this.auth_fetch(
      path,
      {
        body: data,
        method: 'PUT'
      },
      options
    );
  }

  static upload_file(path, file, contentType, options = {}) {
    var data = new FormData();
    data.append('file', file);
    data.append('content_type', contentType);
    this.auth_fetch(
      path,
      {
        body: data,
        method: 'PUT'
      },
      options
    );
  }
}

export const initialPropsHelper = async (ctx, path, key) => {
  let val = null;
  if (ctx.req) {
    try {
      const data = await ApiClient.async_get(path, ctx);
      val = data;
    } catch (e) {
      return {
        _error: true
      };
    }
  }
  return {
    [key]: val,
    query: ctx.query
  };
};

export default ApiClient;
