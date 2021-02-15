import React from 'react';
import Attachment from './Attachment';
import YoutubeEmbed from './YoutubeEmbed';
import SpotifyEmbed from './SpotifyEmbed';
import SoundcloudEmbed from './SoundcloudEmbed';
import WistiaEmbed from './WistiaEmbed';
import {
  getWistiaLinks,
  getYoutubeLinks,
  getSpotifyLinks,
  getSoundcloudLinks,
  getAllLinksFromContent
} from './helpers';

const ContentAttachments = ({ content }) => {
  const links = getAllLinksFromContent(content);
  const youtubeLinks = getYoutubeLinks(links);
  const spotifyLinks = getSpotifyLinks(links);
  const soundCloudLinks = getSoundcloudLinks(links);
  const wistiaLinks = getWistiaLinks(links);

  return (
    <div>
      {youtubeLinks.length
        ? youtubeLinks.map((youtubeLink, idx) => (
            <Attachment key={idx} type='youtube'>
              <YoutubeEmbed url={youtubeLink} />
            </Attachment>
          ))
        : null}
      {spotifyLinks.length
        ? spotifyLinks.map((spotifyLink, idx) => (
            <Attachment key={idx} type='spotify'>
              <SpotifyEmbed url={spotifyLink} />
            </Attachment>
          ))
        : null}
      {soundCloudLinks.length
        ? soundCloudLinks.map((soundCloudLink, idx) => (
            <Attachment key={idx} type='soundcloud'>
              <SoundcloudEmbed url={soundCloudLink} />
            </Attachment>
          ))
        : null}
      {wistiaLinks.length
        ? wistiaLinks.map((wistiaLink, idx) => (
            <Attachment key={idx} type='wistia'>
              <WistiaEmbed url={wistiaLink} />
            </Attachment>
          ))
        : null}
    </div>
  );
};

export default ContentAttachments;
