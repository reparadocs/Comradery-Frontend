import React from 'react';
import { getYoutubeID } from './helpers';

export default ({ url }) => (
  <iframe
    width='325'
    height='250'
    src={`//www.youtube.com/embed/${getYoutubeID(url)}`}
    frameBorder='0'
    allowFullScreen
  />
);
