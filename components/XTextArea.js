import React from 'react';
let cn = require('classnames');
const XTextArea = ({
  label,
  type,
  placeholder,
  containerClassName,
  value,
  onChange,
  name,
  style
}) => (
  <div className={cn([containerClassName, ' cmr c-textarea-container'])}>
    <div className='block text-gray-700 text-sm font-bold mb-2 cmr c-textarea-label'>
      {label}
    </div>
    <textarea
      value={value}
      onChange={onChange}
      name={name}
      style={style}
      className='resize-none h-24 appearance-none border rounded w-full py-2 px-3 text-black focus:outline-none border-gray-500 focus:border-gray-700 cmr c-textarea'
      type={type}
      placeholder={placeholder}
    />
  </div>
);

export default XTextArea;
