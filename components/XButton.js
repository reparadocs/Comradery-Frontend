import React from 'react';
import Loader from 'react-loader-spinner';

const XButton = ({
  onClick,
  children,
  className,
  loading,
  type,
  style,
  variant = 'primary'
}) => {
  const hoverClass =
    variant === 'warning' ? 'hover:bg-red-800' : 'hover:bg-blue-800';
  const bgClass = variant === 'warning' ? 'bg-red-600' : 'bg-blue-700';
  return (
    <button
      onClick={loading ? null : onClick}
      style={style}
      className={
        (loading ? '' : hoverClass) +
        ' ' +
        bgClass +
        ' text-white flex justify-center font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cmr c-any-button ' +
        className
      }
      type={type ? type : 'button'}
    >
      {loading ? (
        <Loader type='Oval' color='white' height={20} width={20} />
      ) : (
        children
      )}
    </button>
  );
};

export default XButton;
