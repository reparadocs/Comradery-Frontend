import React from 'react';
import {
  connectHits,
  Highlight,
  connectStateResults
} from 'react-instantsearch-dom';
import PostCard from '../PostCard';
import { HitSnippet } from './HitSnippet';

const PostHit = ({ hit, track }) => {
  let titleComponent = <Highlight hit={hit} attribute='title' tagName='mark' />;

  return (
    <PostCard
      track={track}
      titleComponent={titleComponent}
      post={hit}
      voter={false}
    >
      <HitSnippet hit={hit} attribute='content' />
    </PostCard>
  );
};

const _PostHits = ({ hits, track, searchResults }) => {
  if (!searchResults || searchResults.nbHits === 0) return null;

  return (
    <div className='cmr c-search-post-container bg-normal post-search'>
      <div className='searchLabel cmr c-search-posts-title'>Posts</div>
      <div className='cmr c-search-posts-results-container'>
        {hits.map((hit) => (
          <PostHit key={hit.objectID} hit={hit} track={track} />
        ))}
      </div>
    </div>
  );
};

export const PostHits = connectHits(connectStateResults(_PostHits));
