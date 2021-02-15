import React, { useState } from 'react';
import ApiClient from '../../ApiClient.js';
import Heart from '../icons/Heart';
let cn = require('classnames');
const Voter = ({
  obj,
  objName,
  authRequired,
  className,
  track,
  iconSize = 20,
  textClassName = 'text-sm',
  votedClassName = '',
  unvotedClassName = '',
  noPadding = false
}) => {
  const [vote, setVote] = useState(obj.vote);
  const [points, setPoints] = useState(obj.points);
  const [lock, setLock] = useState(false);

  const handleVote = (e) => {
    e.stopPropagation();
    track('Voter Clicked', {
      type: objName,
      id: obj.id,
      vote: !vote,
      points: points
    });
    if (authRequired()) {
      ApiClient.post(
        `${objName}/${obj.id}/vote`,
        {
          vote: !vote
        },
        {
          onReturn: () => setLock(false),
          onSuccess: (data) => {
            setPoints(data.points);
            setVote(data.vote);
          }
        }
      );
      if (!lock) {
        setLock(true);
        setPoints((points) => points + (!vote ? 1 : -1));
        setVote((vote) => !vote);
      }
    }
  };
  return (
    <div
      onClick={(e) => handleVote(e)}
      style={{ padding: noPadding ? 0 : 12 }}
      className={cn([
        'voter',
        'row-fs-c',
        { voted: !!vote },
        'cmr',
        'c-voter',
        { 'c-voter-voted': !!vote },
        className
      ])}
    >
      <span className='voter-text c-voter-text'>{points}</span>
      <Heart />
    </div>
  );
};

export default Voter;
