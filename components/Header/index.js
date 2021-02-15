import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Nav from '../Nav';
import Notifications from '../notifications/Notifications';
import { SearchBar } from '../search/SearchBar.js';
let cn = require('classnames');

let search = (
  <svg width='23' height='23' viewBox='0 0 23 23'>
    <path d='M4.71501 4.71492C7.31904 2.1109 11.541 2.1109 14.145 4.71492C16.5614 7.13131 16.7355 10.9409 14.6674 13.558L17.4429 16.3334C17.7493 16.6398 17.7493 17.1365 17.4429 17.4428C17.1366 17.7492 16.6399 17.7492 16.3335 17.4428L13.5581 14.6673C10.941 16.7354 7.1314 16.5613 4.71501 14.1449C2.11098 11.5409 2.11098 7.31895 4.71501 4.71492ZM5.58227 5.62416C3.45692 7.74951 3.45692 11.1954 5.58227 13.3207C7.70761 15.4461 11.1535 15.4461 13.2788 13.3207C15.4042 11.1954 15.4042 7.74951 13.2788 5.62416C11.1535 3.49882 7.70761 3.49882 5.58227 5.62416Z' />
  </svg>
);

export default ({ globals, refreshData, onToggleSearchFocus }) => {
  let [focused, setFocused] = useState(false),
    [searchQuery, setSearchQuery] = useState(''),
    router = useRouter();
  useEffect(() => {
    document.addEventListener('keydown', detectSlash);
    return () => {
      document.removeEventListener('keydown', detectSlash);
    };
  }, []);
  const detectSlash = (e) => {
    if (e.keyCode === 191 && document.activeElement === document.body) {
      e.preventDefault();
      document.getElementById('search-topHead-input').focus();
    }
  };

  if (router.pathname === '/search') return null;
  return (
    <div className='mHead row-c-c'>
      <header className='row-sb-c'>
        <form
          className='searchBar'
          onSubmit={(e) => {
            e.preventDefault();
            let href = '/search?query=' + searchQuery.toLowerCase();
            setSearchQuery('');
            router.push(href, href, { shallow: true });
          }}
        >
          <input
            id='search-topHead-input'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Press / to search'
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {search}
        </form>

        <div className='row-fs-c'>
          <Nav
            globals={globals}
            refreshData={refreshData}
            className='ml-auto'
          ></Nav>
        </div>
        <div className='mHead--placeholder' />
      </header>
    </div>
  );
};
