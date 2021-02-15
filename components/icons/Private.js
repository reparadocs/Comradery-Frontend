import { Lock } from 'react-feather';

export default ({ className, size, containerSize, invert = false }) => (
  <div
    className={'channelLockIcon col-c-c ' + className}
    style={{
      height: containerSize,
      width: containerSize,
      marginRight: 2
    }}
  >
    <Lock size={size} />
  </div>
);
