import Link from 'next/link';
import React from 'react';
import {
  connectHits,
  Highlight,
  connectStateResults
} from 'react-instantsearch-dom';
import UserPhoto from '../UserPhoto';
import { HitSnippet } from './HitSnippet';
import { snippetAttributeMatch } from './SearchHelpers';

const PersonSearchHit = ({ hit, track }) => {
  let bio = null;
  if (snippetAttributeMatch(hit, 'bio')) {
    bio = <HitSnippet hit={hit} attribute='bio' />;
  } else if (hit.bio) {
    bio = hit.bio.substring(0, 80) + (hit.bio.length > 80 ? '...' : '');
  }

  return (
    <Link href={`/profile/[id]`} as={`/profile/${hit.id}`}>
      <div
        onClick={() =>
          track('Person Search Hit Clicked', {
            username: hit.username,
            id: hit.id
          })
        }
        className='personHit px-6 m-3 h-full pt-4 pb-6 bg-white border border-gray-300 rounded-lg shadow cursor-pointer flex flex-row cmr c-search-any-person-container-1'
      >
        <div className='flex flex-col items-center w-72 cmr c-search-any-person-container-2'>
          <UserPhoto person={hit} size={120} />
          <div className='text-xl font-semibold my-3 cmr c-search-any-person-username'>
            <Highlight hit={hit} attribute='username' tagName='mark' />
          </div>
          {bio}
        </div>
      </div>
    </Link>
  );
};

const _PeopleHits = ({ hits, track, searchResults }) => {
  if (!searchResults || searchResults.nbHits === 0) return null;
  return (
    <div className='mb-10 cmr c-search-people-container bg-normal'>
      <div className='searchLabel md:text-left md:mr-auto cmr c-search-people-title'>
        People
      </div>
      <div className='peopleHits flex flex-row overflow-x-scroll h-92 justify-start cmr c-search-people-results-container'>
        {hits.map((hit) => (
          <PersonSearchHit key={hit.objectID} hit={hit} track={track} />
        ))}
      </div>
    </div>
  );
};

export const PeopleHits = connectHits(connectStateResults(_PeopleHits));
