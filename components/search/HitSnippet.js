import React from 'react';
import { connectHighlight } from 'react-instantsearch-dom';
import { snippetAttributeMatch } from './SearchHelpers';

const _Snippet = ({ highlight, attribute, hit }) => {
  const parsedHit = highlight({
    highlightProperty: '_snippetResult',
    attribute,
    hit
  });

  if (snippetAttributeMatch(hit, attribute)) {
    return (
      <span className='mt-2'>
        {parsedHit.map((part, index) =>
          part.isHighlighted ? (
            <mark key={index}>{part.value}</mark>
          ) : (
            <span key={index}>{part.value}</span>
          )
        )}
      </span>
    );
  }

  return null;
};

export const HitSnippet = connectHighlight(_Snippet);
