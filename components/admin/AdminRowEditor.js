import React, { useState } from 'react';
import Loader from 'react-loader-spinner';
import Link from 'next/link';
import UserPhoto from '../UserPhoto';
import XInput from '../XInput';
import dynamic from 'next/dynamic';
import { XCircle, Menu } from 'react-feather';
import Modal from 'react-bootstrap/Modal';
import XButton from '../XButton';
import ConfirmModal from '../ConfirmModal';

const AdminRowEditor = ({ modalTitle, modalContent, onChange, children }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className='flex flex-row items-center w-full justify-between mb-3'>
      {children}
      <XButton
        variant='warning'
        className='mt-2 ml-6'
        style={{ paddingLeft: '0.5em', paddingRight: '0.5em' }}
        onClick={() => setShowDeleteConfirm(true)}
      >
        Delete
      </XButton>

      <ConfirmModal
        isDelete={true}
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        title={modalTitle}
        onConfirm={() => onChange(null)}
      >
        {modalContent}
      </ConfirmModal>
    </div>
  );
};

export default AdminRowEditor;
