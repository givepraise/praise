import {
  faCheckCircle,
  faDotCircle,
  faMinusCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type LineListItemProps = {
  children: React.ReactNode;
  variant: 'check' | 'minus' | 'cross' | 'dot';
  size?: 'small' | 'medium' | 'large';
  liClassName?: string;
};

export function LineListItem({
  children,
  variant,
  size = 'medium',
  liClassName,
}: LineListItemProps): JSX.Element {
  const variants = {
    check: faCheckCircle,
    minus: faMinusCircle,
    cross: faTimesCircle,
    dot: faDotCircle,
  };

  return (
    <li
      className={`relative flex items-center justify-start pl-10 ${liClassName}`}
    >
      <div
        className="absolute w-[2px] h-full bg-black left-4"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      ></div>
      {size === 'small' && (
        <FontAwesomeIcon
          icon={variants[variant]}
          className="absolute w-[0.6rem] h-[0.6rem] transform -translate-y-1/2 bg-white rounded-full left-[0.75rem] top-1/2"
        />
      )}
      {size === 'medium' && (
        <FontAwesomeIcon
          icon={variants[variant]}
          className="absolute w-[0.9rem] h-[0.9rem] transform -translate-y-1/2 bg-white rounded-full left-[0.61rem] top-1/2"
        />
      )}
      {size === 'large' && (
        <FontAwesomeIcon
          icon={variants[variant]}
          className="absolute w-[1.1rem] h-[1.1rem] transform -translate-y-1/2 bg-white rounded-full left-[0.5rem] top-1/2"
        />
      )}

      {children}
    </li>
  );
}
