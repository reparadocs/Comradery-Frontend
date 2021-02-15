import React from 'react';
import styled from 'styled-components';

const AttachmentWrap = styled.div`
  display: flex;
  align-items: stretch;
  position: relative;
  margin: 8px 0 0 0;
  max-width: 600px;
`;

const AttachmentType = styled.span`
  display: flex;
  align-items: center;
  margin-bottom: 3px;

  a {
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }

    span {
      font-weight: 700;
      text-transform: capitalize;
    }

    .icon {
      width: 16px;
      height: 16px;
      border-radius: 2px;
      margin-right: 8px;
      vertical-align: middle;
      box-sizing: content-box;
      overflow: hidden;
    }
  }
`;

const AttachmentBody = styled.div`
  flex: 1;
  padding: 0 12px;
  word-wrap: break-word;
  width: 100%;
`;

const AttachmentBorder = styled.div`
  flex-shrink: 0;
  width: 4px;
  background-color: #e2e8f0;
  border-radius: 8px;
`;

const Attachment = ({ children, type }) => (
  <AttachmentWrap>
    <AttachmentBorder />
    <AttachmentBody>
      <AttachmentType>
        <a
          target='_blank'
          rel='noopener noreferrer'
          href={`https://www.${type}.com`}
        >
          <img
            className='icon'
            alt='Spotify'
            src={`/${type}.png`}
            width='16'
            height='16'
          />
        </a>
        <a
          target='_blank'
          rel='noopener noreferrer'
          href={`https://www.${type}.com`}
        >
          <span>{type}</span>
        </a>
      </AttachmentType>
      {children}
    </AttachmentBody>
  </AttachmentWrap>
);

export default Attachment;
