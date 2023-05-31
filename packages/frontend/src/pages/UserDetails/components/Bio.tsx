import { useRecoilValue } from 'recoil';
import { ReceiverBio, ReceiverLabels } from '../../../model/report/reports';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { InlineLabel } from '../../../components/ui/InlineLabel';

export type BioProps = {
  userAccountId?: string;
};

const BioInner = (props: BioProps): JSX.Element | null => {
  const { userAccountId } = props;
  const bio = useRecoilValue(ReceiverBio(userAccountId));
  const labels = useRecoilValue(ReceiverLabels(userAccountId));

  if (!bio)
    return (
      <>
        <FontAwesomeIcon icon={faRobot} className="mb-[1px] mr-1 opacity-80" />
        Unable to generate contributor bio.
      </>
    );

  return (
    <>
      {bio.split('\n').map((line, index) => (
        <p key={index} className="mb-2">
          {line}
        </p>
      ))}
      <div className="mt-2 whitespace-normal">
        {labels?.split(',').map((label, index) => (
          <>
            <InlineLabel
              key={index}
              text={label.trim()}
              className="uppercase !bg-themecolor-alt-2"
            />{' '}
          </>
        ))}
      </div>
      <div className="mt-2 text-xs text-right">
        <FontAwesomeIcon icon={faRobot} className="mb-[1px] mr-1 opacity-80" />
        The contributor bio and labels are AI generated
      </div>
    </>
  );
};

const BioFallback = (): JSX.Element => {
  return (
    <>
      <FontAwesomeIcon
        icon={faRobot}
        fade
        className="mb-[1px] mr-1 opacity-80"
      />
      Generating contributor bio…
    </>
  );
};

export const Bio = (props: BioProps): JSX.Element | null => {
  if (!props.userAccountId) return null;
  return (
    <div>
      <div className="mt-3 mb-1 font-bold">Contributor bio</div>
      <React.Suspense fallback={<BioFallback />}>
        <BioInner {...props} />
      </React.Suspense>{' '}
    </div>
  );
};
