import React from 'react';

const XInput = ({
  label,
  type,
  autoFocus,
  placeholder,
  className,
  containerClassName,
  value,
  onChange,
  onKeyPress,
  name
}) => (
  <div className={containerClassName}>
    <div className='block text-gray-700 text-sm font-bold mb-2 cmr c-any-input-label'>
      {label}
    </div>
    <input
      value={value}
      onChange={onChange}
      name={name}
      onKeyPress={onKeyPress}
      autoFocus={autoFocus}
      className={
        'appearance-none border rounded w-full py-2 px-3 text-black focus:outline-none border-gray-500 focus:border-gray-700 cmr c-any-input ' +
        className
      }
      type={type}
      placeholder={placeholder}
    />
  </div>
);

export default XInput;
