import React from 'react';
import { getSoundcloudUrl } from './helpers';

const SoundcloudEmbed = ({ url }) => (
  <iframe
    width='100%'
    height='150'
    scrolling='no'
    frameBorder='no'
    allow='autoplay'
    src={getSoundcloudUrl(url)}
  ></iframe>
);

export default SoundcloudEmbed;
