import XInput from '../XInput';
import Callout from '../Callout';
import XTextArea from '../XTextArea';
import XButton from '../XButton';
import Loader from 'react-loader-spinner';
import ApiClient from '../../ApiClient.js';
import { Label } from '../Common';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import React, { useState, useEffect } from 'react';
import ProPlanCard from './ProPlanCard';
import { XCircle } from 'react-feather';
import ErrorMessage from '../ErrorMessage';
import { getHost, getSubdomain } from '../../utils';

const InviteSettings = ({ community }) => {
  const [raw, setRaw] = useState('');
  const [parsedEmails, setParsedEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [emailStatuses, setEmailStatuses] = useState(null);

  const parseEmails = () => {
    setParsedEmails([
      ...new Set([
        ...parsedEmails,
        ...raw.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)
      ])
    ]);
    setRaw('');
  };

  const onSubmit = () => {
    setLoading(true);
    setError(false);
    ApiClient.post(
      `community/${getHost()}/email_invites`,
      { emails: parsedEmails },
      {
        onReturn: () => setLoading(false),
        onError: () => setError(true),
        onSuccess: (data) => {
          setEmailStatuses(data);
        }
      }
    );
  };

  const onClear = () => {
    setRaw('');
    setParsedEmails([]);
    setError(false);
    setLoading(false);
    setEmailStatuses(null);
  };

  let invite_link = null;

  if (typeof window !== 'undefined') {
    invite_link = `${window.location.hostname}?invite_code=${community.invite_code}`;
  }

  return (
    <div className='admin-inner col'>
      <div className='h-10' />
      <Callout title='Email Invite Limit'>
        We've currently limited each community to 1,000 email invites. If you
        need more, we're happy to raise that limit, please just{' '}
        <a
          href='mailto:hello@comradery.io'
          className='underline hover:text-blue-900'
        >
          reach out
        </a>
        !{' '}
        {invite_link && (
          <div>
            <br />
            Alternatively, there's no limit to sharing your universal invite
            link with anyone you want to invite: <b>{invite_link}</b>
          </div>
        )}
      </Callout>
      <Label className='large' marginTop={true}>
        Invite Users
      </Label>
      {loading ? (
        <div className='group flex justify-center items-center'>
          <Loader type='Oval' color='black' size={20} />
        </div>
      ) : (
        <div className='group'>
          {emailStatuses ? (
            <div>
              <div className='text-lg my-3'>Results</div>
              {Object.keys(emailStatuses).map((key, idx) => (
                <div
                  key={idx}
                  className='border-b gorder-gray-500 py-2 flex flex-row'
                >
                  {key} -&nbsp;
                  <div
                    style={{
                      color: emailStatuses[key].includes('Error')
                        ? 'red'
                        : 'green'
                    }}
                  >
                    {emailStatuses[key]}
                  </div>
                </div>
              ))}
              <XButton className='mt-4' onClick={onClear}>
                Invite More People!
              </XButton>
            </div>
          ) : (
            <div>
              <div className='text-lg my-3'>
                Enter email addresses you want to invite. Please seperate
                multiple addresses with commas or newlines
              </div>

              <XTextArea value={raw} onChange={(e) => setRaw(e.target.value)} />
              <XButton className='ml-auto' onClick={parseEmails}>
                Add
              </XButton>
              <div className='text-xl my-4'>
                {parsedEmails.length
                  ? 'Please confirm you would like to invite all of these users'
                  : ''}
              </div>
              {parsedEmails.map((email, idx) => (
                <div
                  className='flex flex-row text-lg items-center border-b border-gray-500 py-2 '
                  key={idx}
                >
                  <div>{email}</div>
                  <XCircle
                    onClick={() => {
                      let c = [...parsedEmails];
                      c.splice(idx, 1);
                      setParsedEmails(c);
                    }}
                    size={15}
                    className='cursor-pointer ml-3 hover:text-red-500'
                  />
                </div>
              ))}

              <ErrorMessage error={error} />
              {!!parsedEmails.length && (
                <XButton onClick={onSubmit} className='mt-4'>
                  Send Invites
                </XButton>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InviteSettings;
