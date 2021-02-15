import React from 'react';
import { connectStateResults } from 'react-instantsearch-dom';
import PageLoading from '../PageLoading';

export const snippetAttributeMatch = (hit, attribute) => {
  return (
    hit._snippetResult &&
    hit._snippetResult[attribute] &&
    hit._snippetResult[attribute].matchLevel !== 'none'
  );
};
