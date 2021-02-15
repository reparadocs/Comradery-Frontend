import React from 'react';
import Link from 'next/link';
import UserPhoto from '../UserPhoto';
import { relativeTime } from '../../utils';
import { Bullet } from '../Common';

const ProPlanCard = ({}) => {
  return (
    <div className='w-full border border-gray-600 mt-2 flex items-center justify-center flex-col py-10 rounded-lg bg-white shadow'>
      <div>This requires a Standard subscription ($100/mo).</div>
      <div>
        <a
          href='mailto:hello@comradery.io'
          className='text-blue-500 hover:underline'
        >
          Contact us to upgrade to Standard!
        </a>
      </div>
    </div>
  );
};

export default ProPlanCard;
