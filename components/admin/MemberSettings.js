import { CopyToClipboard } from 'react-copy-to-clipboard';
let cn = require('classnames');
import React, { useState, useEffect } from 'react';

const dummyMembers = [
  {
    firstName: 'Wayne',
    lastName: 'Tables',
    status: 0
  },
  {
    firstName: 'Wayne',
    lastName: 'Tables',
    status: 0
  },
  {
    firstName: 'Wayne',
    lastName: 'Tables',
    status: 0
  }
];

const dummyStatuses = ['admin', 'member', 'moderator'];

const Dropdown = ({ choices, onChoose, index, person }) => {
  let itemId = 'member-status-action-' + index;
  return (
    <div
      id={itemId}
      tabIndex='0'
      key={index}
      className='absolute z-50 top-8 left-0 bg-white rounded-sm shadow-md	pl-4 pr-4 cmr c-admin-members-statuschangedropdown'
      onBlur={() => document.getElementById(itemId).classList.remove('show')}
    >
      {choices
        .filter((c, i) => i !== person.status)
        .map((choice, i) => (
          <div
            onClick={() => onChoose(choice)}
            className='text-sm capitalize h-10 flex flex-col justify-center select-none hover:text-blue-400 cursor-pointer'
          >
            {choice}
          </div>
        ))}
    </div>
  );
};

const MemberSettings = ({ community, copied, setCopied }) => {
  return (
    <div className="admin-inner col">
      <div className='text-xl'>Members</div>
      <div className='flex flex-row justify-between items-center pl-2 pr-2 text-sm bold w-full mb-2 opacity-50'>
        <span>Name</span>
        <span className='w-24'>Permission</span>
      </div>
      <div className='block	h-64 cmr c-admin-members'>
        {dummyMembers.map((person, index) => (
          <div
            className={cn([
              { 'bg-blue-100': index % 2 === 0 },
              'pl-2 pr-2 h-10 w-auto flex flex-row items-center justify-start cmr c-admin-members-statuschange'
            ])}
            key={index}
          >
            <span className='flex-1'>
              {person.firstName + ' ' + person.lastName}
            </span>
            <div className='flex-row justify-start items-center flex w-24'>
              <div className='relative'>
                <div
                  className='text-sm capitalize pl-2 pr-2 h-6 bg-blue-200 rounded-sm flex flex-row justify-center items-center cursor-pointer'
                  onClick={() => {
                    document
                      .getElementById('member-status-action-' + index)
                      .classList.add('show');
                    document
                      .getElementById('member-status-action-' + index)
                      .focus();
                  }}
                >
                  {dummyStatuses[person.status]}
                  <span className='ml-2'>▼</span>
                </div>
                <Dropdown
                  choices={dummyStatuses}
                  onChoose={() => {}}
                  index={index}
                  person={person}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberSettings;
