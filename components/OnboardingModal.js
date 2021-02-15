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
import { parseCookies, setCookie, destroyCookie } from 'nookies';

const OnboardingModal = ({ community }) => {
  const [show, setShow] = useState(true);

  const onClose = () => {
    setShow(false);
    setCookie({}, 'welcome', true, {
      path: '/',
      expires: new Date('Sat, 22 Feb 2030 06:06:24 GMT')
    });
  };

  if (!community.welcome_message || parseCookies()['welcome']) return null;

  return (
    <div>
      <Modal show={show} size='lg' onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Welcome!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className='a-highlight'
            style={{ fontSize: 18 }}
            dangerouslySetInnerHTML={{ __html: community.welcome_message }}
          ></div>
          <div className='mx-auto'>
            <XButton className='mx-auto' onClick={() => onClose()}>
              OK!
            </XButton>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OnboardingModal;
