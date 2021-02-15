import React from 'react';
import { getSpotifyID } from './helpers';

export default ({ url }) => {
  const isTrack = url.includes('/track/');

  return (
    <iframe
      width='300'
      height='380'
      src={`https://open.spotify.com/embed/${
        isTrack ? `track` : `playlist`
      }/${getSpotifyID(url)}`}
      frameBorder='0'
      allowTransparency='true'
      allow='encrypted-media'
    />
  );
};
