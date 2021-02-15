import React, { useState, useEffect } from 'react';
import { Edit3, ChevronLeft, Edit, ArrowLeft, Edit2 } from 'react-feather';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
let cn = require('classnames');

export const Bullet = ({ className }) => (
  <div className={'cmr c-bullet ' + className} style={{ fontSize: 10 }}>
    &bull;
  </div>
);

export const EditButton = ({ light = false }) => (
  <div className={'common-editButton col-c-c'}>Edit</div>
);

export const PageHeader = ({ title }) => {
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};

export const Label = ({
  children,
  optionalSecondLine,
  marginTop,
  className
}) => (
  <div
    className={cn([
      { includeMarginTop: marginTop },
      className,
      'commonLabel col cmr c-label'
    ])}
  >
    {children}
    {!!optionalSecondLine ? <span>{optionalSecondLine}</span> : null}
  </div>
);

export const TitleComponent = ({ children }) => <div>{children}</div>;

export const BackButton = ({ href, as, globals, light = false }) => {
  if (!href) return null;

  const router = useRouter();

  return (
    <div onClick={() => globals.historyReplace(href, as)}>
      <div
        style={{ borderRadius: 40 }}
        className={'common-backButton col-c-c'}
        onClick={() => globals.track('Back Button Clicked', {})}
      >
        <span>
          <span>←</span> Back
        </span>
      </div>
    </div>
  );
};
