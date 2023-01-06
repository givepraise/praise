import { PraiseDto } from '@/model/praise/praise.dto';
import { faForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@mui/material';

interface ForwarderTooltipProps {
  praise: PraiseDto;
}
export const ForwarderTooltip = ({
  praise,
}: ForwarderTooltipProps): JSX.Element | null => {
  if (praise.forwarder) {
    return (
      <Tooltip
        placement="top-start"
        title={`Forwarded by: ${praise.forwarder.name}`}
        arrow
      >
        <div className="inline-block mr-1">
          <FontAwesomeIcon icon={faForward} size="1x" />
        </div>
      </Tooltip>
    );
  }
  return null;
};
