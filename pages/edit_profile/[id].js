import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import ApiClient, { initialPropsHelper } from '../../ApiClient.js';
import XButton from '../../components/XButton';
import '../../style.css';
import XInput from '../../components/XInput';
import PhotoUpload from '../../components/PhotoUpload';
import { Camera } from 'react-feather';
import XTextArea from '../../components/XTextArea';
import UserPhoto from '../../components/UserPhoto';
import PageLoading from '../../components/PageLoading';
import ErrorMessage from '../../components/ErrorMessage';
import { PageHeader, Label } from '../../components/Common';
import BackLink from '../../components/BackLink';
import { BackButton } from '../../components/Common';
import Notifications from '../../components/notifications/Notifications';
import Nav from '../../components/Nav';
import ConfirmModal from '../../components/ConfirmModal.js';

function EditProfile({ globals, _person, query, refreshData }) {
  const [error, setError] = useState(false);
  const [person, setPerson] = useState(_person);
  const [cfv, setCfv] = useState({});
  const [loading, setLoading] = useState(_person ? false : true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const initializeCustomFields = (p) => {
    let c = {};
    for (var cf of p.custom_field_values) {
      c[cf.field_name] = cf.value;
    }
    setCfv(c);
  };

  useEffect(() => {
    globals.setTab('people');

    if (!_person) {
      ApiClient.get(`_person/${query.id}`, {
        onReturn: () => setLoading(false),
        onError: () => globals.pageError(),
        onSuccess: (data) => {
          initializeCustomFields(data);
          setPerson(data);
        }
      });
    } else {
      initializeCustomFields(_person);
    }
  }, []);

  const updateField = (e) => {
    setPerson({
      ...person,
      [e.target.name]: e.target.value
    });
  };

  const validate = (person) => {
    if (person.username.length > 100) {
      return { error: 'Username too long' };
    }

    if (person.username.length < 4) {
      return { error: 'Username too short' };
    }

    if (person.bio.length > 1000) {
      return { error: 'Bio too long' };
    }

    return { error: false, person };
  };

  const handleSubmit = () => {
    globals.track('Edit Profile Submitted', {
      id: person.id,
      username: person.username,
      bio: person.bio
    });
    setError(false);

    if (globals.authRequired()) {
      setSubmitLoading(true);
      const blob = { ...person, custom_fields_dict: cfv };
      const { error } = ApiClient.post(`_person/${person.id}`, blob, {
        onReturn: () => setSubmitLoading(false),
        onSuccess: (data) => {
          if (person.id === globals.self.id) {
            refreshData();
          }
          router.push(`/profile/[id]`, `/profile/${person.id}`);
        },
        onError: () => setError(true),
        validate
      });
      setError(error);
    }
  };

  if (loading || !person) return <PageLoading />;

  return (
    <div className='editProfile col cmr c-edit-profile-container-1 pc-container'>
      <PageHeader title={`Edit Profile`} />
      <div className='pHead row-sb-c'>
        <BackButton
          href={`/profile/[id]`}
          as={`/profile/${query.id}`}
          globals={globals}
        />
        <Nav
          globals={globals}
          refreshData={refreshData}
          className='ml-auto pHead--nav'
        ></Nav>
      </div>
      <div className='feedNav wide row-fs-c'>
        <h1>Edit Profile</h1>
      </div>

      <div className='editProfile-title col'>
        <span>This info will be visible to all members of the community</span>
      </div>
      <div className='editProfile-mainInfo col'>
        <Label marginTop={true}>Change Photo</Label>
        <PhotoUpload
          path={`person/${person.id}/upload_photo`}
          onChange={(photo_url) => setPerson({ ...person, photo_url })}
        >
          <div className='group relative flex justify-center items-center cmr c-edit-profile-photo-container'>
            <div className='rounded-full bg-black overflow-hidden cmr c-edit-profile-photo'>
              <UserPhoto
                size={88}
                person={person}
                className='opacity-50 group-hover:opacity-25'
              />
            </div>
            <div className='absolute inset-auto text-white flex-col cmr c-edit-profile-photo-label'>
              <Camera className='mx-auto' />
            </div>
          </div>
        </PhotoUpload>
        <Label marginTop={true}>Display Name</Label>
        <XInput
          type='text'
          placeholder='Display Name'
          containerClassName='editProfile-name'
          value={person.username}
          onChange={updateField}
          name='username'
        />
        <Label marginTop={true}>Bio</Label>
        <XTextArea
          type='text'
          containerClassName='editProfile-bio'
          placeholder='Tell us your story'
          value={person.bio}
          onChange={updateField}
          name='bio'
        />
        {globals.community &&
          globals.community.custom_fields.map((field, idx) => (
            <div key={idx} className='w-full'>
              <Label marginTop={true}>{field.name}</Label>
              <XInput
                type='text'
                placeholder={field.name}
                value={cfv[field.name] ? cfv[field.name] : ''}
                onChange={(e) =>
                  setCfv({ ...cfv, [field.name]: e.target.value })
                }
              />
            </div>
          ))}
        <div
          className='editProfile-bottomRow row-sb-c mt-6 cmr c-edit-profile-footer ml-auto'
          style={{ width: 'fit-content' }}
        >
          <ErrorMessage error={error} className='items-center text-center' />

          {globals.self && globals.self.admin && globals.self.id !== person.id && (
            <div>
              <XButton
                variant='warning'
                className='mr-2 cmr c-delete-post-confirm-button'
                onClick={() => {
                  globals.track('Delete Person Clicked', {
                    username: person.username,
                    id: person.id
                  });
                  setShowDeleteConfirm(true);
                }}
              >
                Delete Profile
              </XButton>
              <ConfirmModal
                isDelete={true}
                show={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
                title='Delete Profile?'
                path={`_person/${person.id}`}
                onSuccess={(data) => {
                  globals.track('Delete Person Confirmed', {
                    username: person.username,
                    id: person.id
                  });
                  router.push(`/directory`);
                }}
              >
                This person and user will be irreversably deleted. Posts and
                comments associated with this person will remain but will have
                no owner. Are you sure you want to delete this person:{' '}
                {person.username}?
              </ConfirmModal>
            </div>
          )}

          <XButton
            className='ml-auto'
            onClick={handleSubmit}
            loading={submitLoading}
          >
            Save Profile
          </XButton>
        </div>
      </div>
    </div>
  );
}

EditProfile.getInitialProps = async function (ctx) {
  return await initialPropsHelper(ctx, `_person/${ctx.query.id}`, '_person');
};

export default EditProfile;
