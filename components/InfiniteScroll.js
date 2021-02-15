import React, { useRef, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import ApiClient from '../ApiClient';
import Loader from 'react-loader-spinner';
import Spinner from './Spinner';

const InfiniteScroll = ({
  className,
  onDataLoad,
  path,
  useWindowScroll,
  initialHasNext,
  tolerance,
  children,
  reverse = false
}) => {
  const [loading, setLoading] = useState(false);
  const page = useRef(1);
  const hasNext = useRef(initialHasNext);
  const scrollContainerRef = useRef();

  useEffect(() => {
    if (page.current === 1) {
      hasNext.current = initialHasNext;
    }
  }, [initialHasNext]);

  useEffect(() => {
    const scrollHandler = debounce((e) => {
      if (scrollContainerRef.current) {
        const scrollTop = useWindowScroll
          ? window !== 'undefined'
            ? window.scrollY
            : 0
          : scrollContainerRef.current.scrollTop;

        let testTolerance = reverse
          ? scrollTop
          : scrollContainerRef.current.scrollHeight -
            (scrollTop + scrollContainerRef.current.clientHeight);

        if (testTolerance < tolerance) {
          if (hasNext.current) {
            let pastScrollHeight = scrollContainerRef.current.scrollHeight;
            setLoading(true);
            hasNext.current = false;
            const finalPath = `${path}${
              path.includes('?') ? '&' : '?'
            }page=${page.current + 1}`;
            ApiClient.get(finalPath, {
              onReturn: () => setLoading(false),
              onSuccess: (data) => {
                page.current = parseInt(data.cursor);
                hasNext.current = data.has_next;
                onDataLoad(data.data);
                if (reverse) {
                  window.scrollTo(
                    0,
                    scrollContainerRef.current.scrollHeight - pastScrollHeight
                  );
                }
              }
            });
          }
        }
      }
    }, 200);
    window.addEventListener('scroll', scrollHandler, true);
    return () => window.removeEventListener('scroll', scrollHandler, true);
  }, []);

  return (
    <div
      className={(useWindowScroll ? '' : 'overflow-auto ') + className}
      ref={scrollContainerRef}
    >
      {(loading || hasNext.current) && reverse && (
        <div className='w-full flex justify-center items-center p-10'>
          <Spinner />
        </div>
      )}
      {children}
      {(loading || hasNext.current) && !reverse && (
        <div className='w-full flex justify-center items-center p-10'>
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
