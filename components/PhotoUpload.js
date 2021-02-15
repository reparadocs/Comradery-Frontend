import React, { useState, useEffect } from 'react';
import Loader from 'react-loader-spinner';
import Modal from 'react-bootstrap/Modal';
import ApiClient from '../ApiClient.js';
import XButton from './XButton';
import ReactCrop from 'react-image-crop';
import ErrorMessage from '../components/ErrorMessage';

const PhotoUpload = ({ path, children, onChange, _defaultCrop }) => {
  const DEFAULT_CROP = _defaultCrop
    ? _defaultCrop
    : {
        aspect: 1,
        width: 50,
        height: 50,
        x: 0,
        y: 0
      };
  const [photo, setPhoto] = useState(null);
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState(DEFAULT_CROP);
  const [croppedFile, setCroppedFile] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    makeClientCrop(DEFAULT_CROP);
  }, [image]);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setPhoto(reader.result);
      });
      setShow(true);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    ApiClient.upload_photo(path, croppedFile, 'photo', {
      onReturn: () => setLoading(false),
      onError: () => setError(true),
      onSuccess: (data) => {
        onChange(data.photo_url);
        handleClose();
      }
    });
  };

  const handleClose = () => {
    setPhoto(null);
    setInputKey((inputKey) => inputKey + 1);
    setCrop(DEFAULT_CROP);
    setImage(null);
    setCroppedFile(null);
    setShow(false);
  };

  const makeClientCrop = async (crop, pixelCrop) => {
    if (image && crop.width && crop.height) {
      const canvas = document.createElement('canvas');

      const IMAGE_SIZE = 400;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      let iHeight = IMAGE_SIZE,
        iWidth = IMAGE_SIZE;
      if (crop.height > crop.width) {
        iWidth = IMAGE_SIZE * (crop.width / crop.height);
      } else {
        iHeight = IMAGE_SIZE * (crop.height / crop.width);
      }
      canvas.width = iWidth;
      canvas.height = iHeight;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        iWidth,
        iHeight
      );

      const promiseBlob = new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          blob.name = 'profile.png';
          blob.lastModifiedDate = new Date();
          resolve(blob);
        }, 'image/png');
      });

      const croppedImageFile = await promiseBlob;
      setCroppedFile(croppedImageFile);
    }
  };

  return (
    <div>
      <label htmlFor='file-upload' className='w-full h-full cursor-pointer'>
        <input
          id='file-upload'
          accept='image/*'
          type='file'
          key={inputKey}
          style={{ display: 'none' }}
          onChange={onSelectFile}
        />
        {children}
      </label>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='flex items-center justify-center cmr c-upload-photo-crop'>
            {photo ? (
              <ReactCrop
                disabled={loading}
                src={photo}
                crop={crop}
                onImageLoaded={(image) => setImage(image)}
                onComplete={(crop, pixelCrop) =>
                  makeClientCrop(crop, pixelCrop)
                }
                onChange={(crop, pixelCrop) => setCrop(crop)}
              />
            ) : (
              <Loader type='Oval' color='black' height={20} width={20} />
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ErrorMessage error={error} />
          <span
            onClick={() => {
              handleClose();
            }}
            className='inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 cursor-pointer cmr c-upload-photo-cancel'
          >
            Cancel
          </span>
          <XButton variant='primary' onClick={handleSubmit} loading={loading}>
            Save
          </XButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PhotoUpload;
