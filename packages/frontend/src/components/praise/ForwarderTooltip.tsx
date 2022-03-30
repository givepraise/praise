import { faForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';

interface ForwarderTooltipProps {
  praise: PraiseDto;
}
export const ForwarderTooltip = ({
  praise,
}: ForwarderTooltipProps): JSX.Element | null => {
  if (praise.forwarder) {
    return (
      <div className="inline-block mr-1">
        <FontAwesomeIcon
          icon={faForward}
          size="1x"
          title={`Forwarded by: ${praise.forwarder.name}`}
        />
      </div>
    );
  }
  return null;
};
