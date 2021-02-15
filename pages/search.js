import algoliasearch from 'algoliasearch/lite';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Hits, Index, InstantSearch } from 'react-instantsearch-dom';
import PageLoading from '../components/PageLoading';
import { PeopleHits } from '../components/search/PeopleHits';
import { PostHits } from '../components/search/PostHit';
import { SearchBar } from '../components/search/SearchBar';
import '../style.css';
import { PageHeader, TitleComponent } from '../components/Common';
import { searchIndexName } from '../utils';
import Notifications from '../components/notifications/Notifications';
import Nav from '../components/Nav';

function Search({ globals, refreshData }) {
  const router = useRouter();
  const { query } = router.query;
  const [searchState, setSearchState] = useState({ query: query });

  useEffect(() => {
    globals.setTab('search');
  }, []);

  useEffect(() => {
    setSearchState({ query: query });
  }, [query]);

  if (!globals.searchClient) return <PageLoading />;

  return (
    <div className='searchContainer col-fs-c cmr c-search-container'>
      <PageHeader title={`Search: ${query}`} />

      <InstantSearch
        searchClient={globals.searchClient}
        indexName={searchIndexName()}
        searchState={searchState}
        onSearchStateChange={(searchState) => {
          setSearchState(searchState);
        }}
      >
        <div className='w-full flex flex-row items-center '>
          <SearchBar track={globals.track} />
          <Nav
            globals={globals}
            refreshData={refreshData}
            className='ml-auto pl-2 '
          ></Nav>
        </div>

        <div
          className='w-full cmr c-search-results-container'
          style={{ minHeight: 100 }}
        >
          <div
            style={{ zIndex: -1 }}
            className='w-full absolute text-center font-normal text-lg mt-10 cmr c-search-no-results-found'
          >
            No Results Found
          </div>
          <Index indexName={searchIndexName('person')}>
            <PeopleHits track={globals.track} />
          </Index>
          <div className='cmr c-search-posts-container'>
            <Index indexName={searchIndexName()}>
              <PostHits track={globals.track} />
            </Index>
          </div>
        </div>
      </InstantSearch>
    </div>
  );
}

export default Search;
