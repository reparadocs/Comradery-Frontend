import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const VideoWrapper = styled.div`
  width: 325px;
  height: 250px;

  iframe {
    width: 325px;
    height: 250px;
  }
`;

const WistiaEmbed = ({ url }) => {
  const [videoData, setVideoData] = useState();

  useEffect(() => {
    fetch(`http://fast.wistia.net/oembed?url=${url}`)
      .then((data) => data.json())
      .then((data) => {
        setVideoData(data);
      });
  }, []);

  return (
    <>
      {videoData && videoData.html && (
        <VideoWrapper dangerouslySetInnerHTML={{ __html: videoData.html }} />
      )}
    </>
  );
};

export default WistiaEmbed;
