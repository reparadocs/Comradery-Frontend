import React, { useState } from 'react';
import '../style.css';

const Dropdown = ({
  onChange,
  iconClassName,
  value,
  className,
  optionsClassName,
  display = null,
  options
}) => {
  const [open, setOpen] = useState(false);

  if (!value || !options) {
    return null;
  }

  if (!display) {
    display = (obj) => obj;
  }

  return (
    <div
      className='outline-none w-full relative cmr c-dropdown-container'
      onBlur={() =>
        setTimeout(() => {
          if (open) {
            setOpen(false);
          }
        }, 200)
      }
      tabIndex={0}
    >
      <button
        onClick={() => setOpen(!open)}
        className={
          'inline-flex items-center focus:outline-none cmr c-dropdown-button ' +
          className
        }
      >
        {display(value)}
        <svg className={iconClassName} fill='currentColor' viewBox='0 0 24 24'>
          <path d='M15.3 9.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4l3.3 3.29 3.3-3.3z' />
        </svg>
      </button>

      {open && (
        <div
          className={
            'xDropdown z-10 mt-3 cmr c-dropdown-options-container-1 ' +
            optionsClassName
          }
        >
          <div className='cmr c-dropdown-options-container-2'>
            {options.map((option, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  onChange(option);
                  setOpen(false);
                }}
                className='row-sb-c cmr c-dropdown-option'
              >
                {display(option)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
