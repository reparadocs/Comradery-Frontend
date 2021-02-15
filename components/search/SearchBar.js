import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Search as SearchIcon } from 'react-feather';
import { connectSearchBox } from 'react-instantsearch-core';

let search =
<svg width="23" height="23" viewBox="0 0 23 23">
  <path d="M4.71501 4.71492C7.31904 2.1109 11.541 2.1109 14.145 4.71492C16.5614 7.13131 16.7355 10.9409 14.6674 13.558L17.4429 16.3334C17.7493 16.6398 17.7493 17.1365 17.4429 17.4428C17.1366 17.7492 16.6399 17.7492 16.3335 17.4428L13.5581 14.6673C10.941 16.7354 7.1314 16.5613 4.71501 14.1449C2.11098 11.5409 2.11098 7.31895 4.71501 4.71492ZM5.58227 5.62416C3.45692 7.74951 3.45692 11.1954 5.58227 13.3207C7.70761 15.4461 11.1535 15.4461 13.2788 13.3207C15.4042 11.1954 15.4042 7.74951 13.2788 5.62416C11.1535 3.49882 7.70761 3.49882 5.58227 5.62416Z" />
</svg>

const _SearchBar = ({ currentRefinement, isSearchStalled, refine, track }) => {
  const router = useRouter();

  return (
    <div className='searchBar onSearchPage cmr c-search-bar'>
      <input
        autoFocus
        value={currentRefinement}
        onChange={(e) => {
          refine(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            track('Search - Query Changed', { query: currentRefinement });
            let href = '/search?query=' + currentRefinement;
            router.push(href, href, { shallow: true });
          }
        }}
        className='cmr c-search-bar-input'
        type='text'
      />
      {search}
    </div>
  );
};

export const SearchBar = connectSearchBox(_SearchBar);
