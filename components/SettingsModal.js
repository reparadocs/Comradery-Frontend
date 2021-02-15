import React, { useState, useEffect } from 'react';
import Loader from 'react-loader-spinner';
import Link from 'next/link';
import UserPhoto from './UserPhoto';
import Modal from 'react-bootstrap/Modal';
import XButton from './XButton';
import ApiClient from '../ApiClient.js';
import ErrorMessage from './ErrorMessage';
import { Settings, X, Check, Plus, Lock, PlusCircle } from 'react-feather';
import { Picker } from 'emoji-mart';
import XInput from './XInput';
import Toggle from 'react-toggle';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { Search as SearchIcon } from 'react-feather';
import { searchIndexName } from '../utils';
import {
  connectSearchBox,
  connectHits,
  Highlight,
  connectStateResults,
  connectCurrentRefinements
} from 'react-instantsearch-core';
import Spinner from './Spinner';
import Private from './icons/Private';
import { useToasts } from 'react-toast-notifications';

const PersonRow = ({ person, children }) => (
  <div className='flex flex-row items-center py-2 justify-center'>
    <UserPhoto person={person} size={20} />
    <div className='w-2' />
    {person.username}
    {children}
  </div>
);

const _SearchBar = ({ currentRefinement, isSearchStalled, refine, track }) => {
  return (
    <div
      className='row-fs-c  w-full cmr c-search-bar'
      style={{ background: '#E7F2FA', borderRadius: 100, overflow: 'hidden' }}
    >
      <div className='mx-3'>
        <SearchIcon size={24} color='gray' />
      </div>
      <input
        autoFocus
        placeholder='Search to add a member'
        value={currentRefinement}
        onChange={(e) => {
          refine(e.target.value);
        }}
        className='appearance-none w-full py-2 rounded  text-gray-700 focus:outline-none cmr c-search-bar-input'
        style={{ background: '#E7F2FA' }}
        type='text'
      />
    </div>
  );
};

const SearchBar = connectSearchBox(_SearchBar);

const _PeopleHits = ({
  hits,
  searchResults,
  addPerson,
  removePerson,
  members
}) => {
  return (
    <div className='flex flex-col'>
      {hits.map((hit) => {
        const isMember =
          members.findIndex((element) => element.id === hit.id) > -1;

        return (
          <PersonRow key={hit.objectID} person={hit}>
            <div
              onClick={() => (isMember ? removePerson(hit) : addPerson(hit))}
              className='ml-auto cursor-pointer font-bold text-gray-500 hover:text-gray-800 items-center justify-center flex'
            >
              {isMember ? (
                <Check
                  size={15}
                  className='text-purple-500 hover:text-purple-300'
                />
              ) : (
                <Plus size={15} />
              )}
            </div>
          </PersonRow>
        );
      })}
    </div>
  );
};

const PeopleHits = connectHits(connectStateResults(_PeopleHits));

const _ClearRefinements = ({ refine, items }) => (
  <div
    className=' ml-2 flex items-center justify-center cursor-pointer hover:text-gray-700 text-gray-500 p-1 rounded-full'
    style={{ width: 'fit-content', height: 'fit-content' }}
    onClick={() => refine(items)}
  >
    <X />
  </div>
);

const ClearRefinements = connectCurrentRefinements(_ClearRefinements);

const SettingsModal = ({
  channelID,
  searchClient,
  refreshCommunity,
  create
}) => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [channel, setChannel] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const { addToast } = useToasts();

  useEffect(() => {
    if (create) {
      setChannel({
        private: false,
        emoji: '😊',
        name: '',
        private_members: []
      });
    } else {
      ApiClient.get(`channel/${channelID}`, {
        onSuccess: (data) => setChannel(data)
      });
    }
  }, []);

  const addPerson = (person) => {
    let _members = [...channel.private_members];
    _members.push(person);

    setChannel({ ...channel, private_members: _members });
  };

  const removePerson = (person) => {
    let _members = [...channel.private_members];
    _members = _members.filter((m) => m.id !== person.id);

    setChannel({ ...channel, private_members: _members });
  };

  const onClose = () => {
    setShowSearch(false);
    setShowEmojiPicker(false);
    setShow(false);
  };

  const onSubmit = () => {
    setError(false);
    setLoading(true);
    let members = channel.private_members.map((m) => m.id);
    ApiClient.post(
      create ? `channels` : `channel/${channel.id}`,
      { ...channel, members },
      {
        onReturn: () => setLoading(false),
        onError: () => setError(true),
        onSuccess: (data) => {
          refreshCommunity();
          addToast('Saved!', {
            appearance: 'success',
            autoDismiss: true,
            placement: 'top-center',
            autoDismissTimeout: 3000
          });
          onClose();
        }
      }
    );
  };

  return (
    <div>
      <div onClick={() => setShow(true)}>
        {create ? <PlusCircle size={16} /> : <Settings size={15} />}
      </div>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Channel Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ height: 'max(400px, 50vh)' }} className='flex flex-col'>
            {channel ? (
              <div className='h-full'>
                <div className='flex flex-row justify-center items-center'>
                  {channel.private ? (
                    <Private invert containerSize={36} size={18} className='mt-2' />
                  ) : (
                    <div
                      className='relative flex outline-none'
                      onBlur={() =>
                        setTimeout(() => {
                          if (showEmojiPicker) {
                            setShowEmojiPicker(false);
                          }
                        }, 200)
                      }
                      tabIndex={0}
                    >
                      <div
                        className='text-xl cursor-pointer hover:bg-gray-500 border-gray-500 border rounded  mt-2'
                        style={{
                          minHeight: 40,
                          minWidth: 40,
                          paddingLeft: 9,
                          paddingTop: 6
                        }}
                        onClick={() => {
                          setShowEmojiPicker((current) => !current);
                        }}
                      >
                        {channel.emoji}
                      </div>
                      <div
                        className={
                          showEmojiPicker ? 'block shadow-lg' : 'hidden'
                        }
                        style={{ position: 'absolute', top: 80 }}
                      >
                        <Picker
                          title='Select Emoji!'
                          darkMode={false}
                          emoji=''
                          onSelect={(emoji) => {
                            setChannel({ ...channel, emoji: emoji.native });
                            setShowEmojiPicker(false);
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <XInput
                    containerClassName='w-full ml-6'
                    placeholder='Channel Name'
                    value={channel.name}
                    onChange={(e) => {
                      setChannel({ ...channel, name: e.target.value });
                    }}
                  />
                </div>
                <div className='flex flex-row py-2 my-2'>
                  <div className='text-lg font-bold'>Private</div>
                  <div className='ml-auto'>
                    <Toggle
                      checked={channel.private}
                      onChange={(e) =>
                        setChannel({ ...channel, private: e.target.checked })
                      }
                    />
                  </div>
                </div>
                <div
                  className={channel.private ? 'block' : 'hidden '}
                  style={{ height: 'calc(100% - 160px)' }}
                >
                  <InstantSearch
                    searchClient={searchClient}
                    indexName={searchIndexName('person')}
                    onSearchStateChange={(ss) =>
                      setShowSearch(ss.query.length > 0)
                    }
                  >
                    <div className='flex flex-row items-center justify-center w-full'>
                      <SearchBar />
                      {showSearch && <ClearRefinements clearsQuery />}
                    </div>
                    {!showSearch && (
                      <div className='text-xl font-bold mt-2'>Members</div>
                    )}
                    <div className='h-full'>
                      {showSearch ? (
                        <div
                          className='flex flex-col overflow-scroll border rounded p-1 mt-2 pr-4'
                          style={{ height: 'calc(100% - 45px)' }}
                        >
                          <PeopleHits
                            members={channel.private_members}
                            addPerson={addPerson}
                            removePerson={removePerson}
                          />
                        </div>
                      ) : (
                        <div
                          className='flex flex-col overflow-scroll border rounded p-1 mt-2 pr-4'
                          style={{ height: 'calc(100% - 80px)' }}
                        >
                          {channel.private_members.length ? (
                            <div>
                              {channel.private_members.map((person) => (
                                <PersonRow person={person} key={person.id}>
                                  <div
                                    onClick={() => removePerson(person)}
                                    className='ml-auto cursor-pointer font-bold text-gray-500 hover:text-gray-800 items-center justify-center flex'
                                  >
                                    <X size={15} />
                                  </div>
                                </PersonRow>
                              ))}
                            </div>
                          ) : (
                            <div className='text-center text-gray-600 mt-10'>
                              No Members Yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </InstantSearch>
                </div>
                <div className='absolute' style={{ bottom: 10, right: 15 }}>
                  <div className='flex flex-row'>
                    <ErrorMessage className='mr-4' error={error} />
                    <XButton
                      loading={loading}
                      onClick={onSubmit}
                      className='ml-auto'
                    >
                      Save
                    </XButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className='w-full flex items-center justify-center'>
                <Spinner />
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SettingsModal;
