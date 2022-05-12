import { localizeAndFormatIsoDate } from '@/utils/date';
import getMarkdownText from '@/components/MarkdownText';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
import { PraiseDto, QuantificationDto } from 'api/dist/praise/types';
import { UserPseudonym } from '@/components/user/UserPseudonym';
import { InlineLabel } from '@/components/InlineLabel';
import { useRecoilValue } from 'recoil';
import { ActiveUserId } from '@/model/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';

const getRemoveButton = (callback: (() => void) | undefined): JSX.Element => {
  return (
    <button onClick={callback} className="ml-2">
      <FontAwesomeIcon
        className="text-white text-opacity-50 hover:text-opacity-100"
        icon={faTimes}
        size="1x"
      />
    </button>
  );
};

interface Params {
  praise: PraiseDto | undefined;
  variant?: 'regular' | 'quantify';
  className?: string;
  receiver?: boolean;
  periodId?: string;
  handleRemoveDismiss?: () => void;
  handleRemoveDuplicate?: () => void;
}

const Praise = ({
  praise,
  variant = 'regular',
  className = '',
  receiver = false,
  periodId = '',
  handleRemoveDismiss,
  handleRemoveDuplicate,
}: Params): JSX.Element | null => {
  const userId = useRecoilValue(ActiveUserId);

  const usePseudonyms = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS'
  ) as boolean;

  if (!praise) return null;

  const quantification = (praise: PraiseDto): QuantificationDto | undefined => {
    return praise.quantifications.find((q) => q.quantifier === userId);
  };

  const dismissed = (praise: PraiseDto): boolean => {
    const q = quantification(praise);
    return q ? !!q.dismissed : false;
  };

  const duplicate = (praise: PraiseDto): boolean => {
    const q = quantification(praise);
    return q ? (q.duplicatePraise ? true : false) : false;
  };

  const shortDuplicatePraiseId = (praise: PraiseDto): string => {
    const q = quantification(praise);
    return q && q.duplicatePraise ? q.duplicatePraise?.slice(-4) : '';
  };

  return variant === 'regular' ? (
    <div className={`flex items-center w-full ${className}`}>
      <div className="flex items-center">
        <UserAvatar userAccount={praise.giver} />
      </div>
      <div className="flex-grow p-3 overflow-hidden">
        <div>
          <ForwarderTooltip praise={praise} />
          <span className="font-bold">{praise.giver.name}</span>
          {receiver ?? (
            <>
              <span>to </span>
              <span className="font-bold">{praise.receiver.name}</span>
            </>
          )}

          <span className="ml-2 text-xs text-gray-500">
            {localizeAndFormatIsoDate(praise.createdAt)}
          </span>
        </div>

        <div
          className="w-full"
          dangerouslySetInnerHTML={{
            __html: `<Linkify>${getMarkdownText(praise.reason)}</Linkify>`,
          }}
        ></div>
      </div>
    </div>
  ) : (
    <>
      <td>
        <div className="items-center w-full">
          <div className="flex items-center">
            <UserAvatar
              userAccount={praise.giver}
              usePseudonym={usePseudonyms}
            />
          </div>
        </div>
      </td>
      <td>
        <div>
          <span className="font-bold">
            <ForwarderTooltip praise={praise} />
            {usePseudonyms ? (
              <UserPseudonym userId={praise.giver._id} periodId={periodId} />
            ) : (
              praise.giver.name
            )}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            {localizeAndFormatIsoDate(praise.createdAt)}
          </span>
        </div>
        <div className="w-[550px overflow-hidden overflow-ellipsis">
          <span>
            <InlineLabel
              text={`#${praise._id.slice(-4)}`}
              className="bg-gray-400 h-5 float-left"
            />
            {dismissed(praise) ? (
              <>
                <InlineLabel
                  text="Dismissed"
                  button={getRemoveButton(handleRemoveDismiss)}
                  className="bg-red-600 h-5 float-left"
                />
                <span className="line-through">
                  <div
                    className="w-full"
                    dangerouslySetInnerHTML={{
                      __html: getMarkdownText(praise.reason),
                    }}
                  ></div>
                </span>
              </>
            ) : duplicate(praise) ? (
              <>
                <InlineLabel
                  text={`Duplicate of: #${shortDuplicatePraiseId(praise)}`}
                  button={getRemoveButton(handleRemoveDuplicate)}
                  className="h-5 float-left"
                />
                <span className="text-gray-400">
                  <div
                    className="w-full"
                    dangerouslySetInnerHTML={{
                      __html: getMarkdownText(praise.reason),
                    }}
                  ></div>
                </span>
              </>
            ) : (
              <span
                className=""
                dangerouslySetInnerHTML={{
                  __html: getMarkdownText(praise.reason),
                }}
              ></span>
            )}
          </span>
        </div>
      </td>
    </>
  );
};

export default Praise;
