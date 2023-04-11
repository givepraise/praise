import {
  faArrowRight,
  faArrowTrendDown,
  faArrowTrendUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const LargeValueChangePill = ({
  value1,
  value2,
}: {
  value1: number;
  value2: number;
}): JSX.Element => {
  const diff = value1 - value2;
  const diffPercent = Math.round((diff / value2) * 100);

  return (
    <div className="inline-block float-right p-2 text-xs bg-opacity-50 border rounded-full bg-themecolor-3">
      {diff > 0 && (
        <div>
          <span>
            <FontAwesomeIcon icon={faArrowTrendUp} size="1x" className="mr-1" />
          </span>
          <span>{diffPercent}%</span>
        </div>
      )}
      {diff < 0 && (
        <div>
          <span>
            <FontAwesomeIcon
              icon={faArrowTrendDown}
              size="1x"
              className="mr-1"
            />
          </span>
          <span> {diffPercent}%</span>
        </div>
      )}
      {diff === 0 && (
        <div>
          <span>
            <FontAwesomeIcon icon={faArrowRight} size="1x" className="mr-1" />
          </span>
          <span> {diffPercent}%</span>
        </div>
      )}
    </div>
  );
};
