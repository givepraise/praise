import { PraiseDto } from 'api/dist/praise/types';
import { Praise } from '@/components/praise/Praise';
import { PraiseRow } from '@/components/praise/PraiseRow';
import { Box } from '@/components/ui/Box';

interface Props {
  praiseList: PraiseDto[];
}

export const GiverReceiverSummaryPraiseItems = ({
  praiseList,
}: Props): JSX.Element => {
  return (
    <Box className="p-0">
      <ul>
        {praiseList?.map((praise) => (
          <PraiseRow praise={praise} key={praise?._id}>
            <Praise praise={praise} className="p-5" />
          </PraiseRow>
        ))}
      </ul>
    </Box>
  );
};
