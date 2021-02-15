import React, { useState } from 'react';
import Loader from 'react-loader-spinner';
import Link from 'next/link';
import UserPhoto from './UserPhoto';
import Modal from 'react-bootstrap/Modal';
import XButton from './XButton';
import ApiClient from '../ApiClient.js';
import ErrorMessage from './ErrorMessage';

const ConfirmModal = ({
  show,
  onHide,
  title,
  children,
  isDelete,
  onConfirm,
  postData = {},
  path,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer className='flex-col'>
        <ErrorMessage error={error} />

        <div className='flex flex-row ml-auto items-center cmr c-delete-confirm-container'>
          <div
            onClick={onHide}
            className='inline-block cursor-pointer align-baseline mr-3 font-bold text-sm text-blue-500 hover:text-blue-800 cmr c-delete-confirm-cancel'
          >
            Cancel
          </div>
          <XButton
            variant='warning'
            loading={loading}
            onClick={() => {
              if (onConfirm) {
                onConfirm();
                onHide();
              }
              if (path) {
                const options = {
                  onReturn: () => setLoading(false),
                  onError: () => setError(true),
                  onSuccess: (data) => {
                    onSuccess(data);
                    onHide();
                  }
                };

                setLoading(true);

                isDelete
                  ? ApiClient.delete(path, options)
                  : ApiClient.post(path, postData, options);
              }
            }}
            className='ml-auto cmr c-delete-confirm'
          >
            {isDelete ? 'Delete' : 'Confirm'}
          </XButton>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
