import { UserPseudonym } from "@/components/user/UserPseudonym";
import { ActiveUserId } from "@/model/auth";
import {
  PeriodActiveQuantifierReceiverPraise,
  usePeriodPraiseQuery,
} from "@/model/periods";
import { Praise, useQuantifyPraise } from "@/model/praise";
import { SingleBooleanSetting } from "@/model/settings";
import DismissDialog from "@/pages/QuantifyPeriodReceiver/components/DismissDialog";
import { formatDate } from "@/utils/date";
import { classNames, getPraiseMark, getPraiseMarks } from "@/utils/index";
import {
  faCopy,
  faTimes,
  faTimesCircle,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@headlessui/react";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import DuplicateDialog from "./DuplicateDialog";
import RangeSlider from "./RangeSlider";

interface InlineLabelProps {
  text: string;
  button: any;
  className?: string;
}
const InlineLabel = ({ text, button, className }: InlineLabelProps) => {
  return (
    <span
      className={classNames(
        className,
        "h-6 pl-1 pr-1 mr-1 text-xs text-white no-underline bg-black py-[1px] rounded"
      )}
    >
      {text}
      {button}
    </span>
  );
};

const getQuantification = (praise: Praise, quantifierId: string) => {
  return praise!.quantifications!.find((q) => q.quantifier === quantifierId);
};

const QuantifyTable = () => {
  const { periodId, receiverId } = useParams() as any;
  usePeriodPraiseQuery(periodId);
  const userId = useRecoilValue(ActiveUserId);
  const data = useRecoilValue(
    PeriodActiveQuantifierReceiverPraise({ periodId, receiverId })
  );
  const usePseudonyms = useRecoilValue(
    SingleBooleanSetting("PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS")
  );

  const { quantify } = useQuantifyPraise();

  let [isDismissDialogOpen, setIsDismissDialogOpen] = React.useState(false);
  let [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = React.useState(false);
  let [selectedPraise, setSelectedPraise] = React.useState<Praise | undefined>(
    undefined
  );

  const handleChange = (value: number) => {
    const quantification = getQuantification(selectedPraise!, userId!);
    quantify(
      selectedPraise!._id,
      (getPraiseMarks() as any)[value.toString()],
      quantification!.dismissed ? quantification!.dismissed : false,
      quantification!.duplicatePraise ? quantification!.duplicatePraise : null
    );
  };

  const handleDismiss = () => {
    quantify(selectedPraise!._id, 0, true, null);
  };

  const handleDuplicate = (duplicatePraiseId: string) => {
    quantify(selectedPraise!._id, 0, false, duplicatePraiseId);
  };

  const handleRemoveDismiss = (id: string) => {
    quantify(selectedPraise!._id, 0, false, null);
  };

  const handleRemoveDuplicate = (id: string) => {
    quantify(selectedPraise!._id, 0, false, null);
  };

  const getRemoveButton = (action: any) => {
    return (
      <button onClick={action} className="ml-2">
        <FontAwesomeIcon
          className="text-white text-opacity-50 hover:text-opacity-100"
          icon={faTimes}
          size="1x"
        />
      </button>
    );
  };

  if (!data) return null;

  const quantification = (praise: Praise) => {
    return praise.quantifications!.find((q) => q.quantifier === userId);
  };

  const dismissed = (praise: Praise) => {
    const q = quantification(praise);
    return q ? !!q.dismissed : false;
  };

  const duplicate = (praise: Praise) => {
    const q = quantification(praise);
    return q ? (q.duplicatePraise ? true : false) : false;
  };

  const score = (praise: Praise) => {
    const q = quantification(praise);
    return q && q.score ? getPraiseMark(q.score) : 0;
  };

  return (
    <table className="w-full table-auto">
      <tbody>
        {data.map((praise, index) => {
          if (!praise) return null;
          return (
            <tr key={index} onMouseDown={() => setSelectedPraise(praise)}>
              <td>
                <div className="flex items-center w-full">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faUserCircle} size="2x" />
                  </div>
                  <div className="flex-grow p-3 whitespace-nowrap">
                    {formatDate(praise.createdAt)}
                    <br />
                    {usePseudonyms ? (
                      <UserPseudonym
                        userId={praise.giver._id!}
                        periodId={periodId}
                      />
                    ) : (
                      praise.giver.username
                    )}
                    <br />#{praise._id.slice(-4)}
                  </div>
                </div>
              </td>
              <td>
                <div className="flex space-x-1">
                  {dismissed(praise) ? (
                    <span>
                      <InlineLabel
                        text="Dismissed"
                        button={getRemoveButton(handleRemoveDismiss)}
                        className="bg-red-600"
                      />
                      <span className="line-through">{praise.reason}</span>
                    </span>
                  ) : duplicate(praise) ? (
                    <span>
                      <InlineLabel
                        text={`Duplicate of: #${quantification(
                          praise
                        )!.duplicatePraise?.slice(-4)}`}
                        button={getRemoveButton(handleRemoveDuplicate)}
                      />
                      <span className="line-through">{praise.reason}</span>
                    </span>
                  ) : (
                    praise.reason
                  )}
                </div>
              </td>
              <td>
                <div className="flex space-x-3">
                  <RangeSlider
                    marks={getPraiseMarks()}
                    defaultValue={score(praise)}
                    onValueChanged={(value: number) => handleChange(value)}
                    disabled={dismissed(praise) || duplicate(praise)}
                  ></RangeSlider>
                  <button
                    className="hover:text-gray-400"
                    disabled={duplicate(praise)}
                    onClick={() => setIsDuplicateDialogOpen(true)}
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      size="1x"
                      className={duplicate(praise) ? "text-gray-400" : ""}
                    />
                  </button>
                  <button
                    className="hover:text-gray-400"
                    disabled={dismissed(praise)}
                    onClick={() => setIsDismissDialogOpen(true)}
                  >
                    <FontAwesomeIcon
                      icon={faTimesCircle}
                      size="1x"
                      className={dismissed(praise) ? "text-gray-400" : ""}
                    />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}

        <React.Suspense fallback={null}>
          <Dialog
            open={isDismissDialogOpen && !!selectedPraise}
            onClose={() => setIsDismissDialogOpen(false)}
            className="fixed inset-0 z-10 overflow-y-auto"
          >
            <DismissDialog
              praise={selectedPraise}
              onClose={() => setIsDismissDialogOpen(false)}
              onDismiss={() => handleDismiss()}
            />
          </Dialog>
        </React.Suspense>

        <React.Suspense fallback={null}>
          <Dialog
            open={isDuplicateDialogOpen}
            onClose={() => setIsDuplicateDialogOpen(false)}
            className="fixed inset-0 z-10 overflow-y-auto"
          >
            <DuplicateDialog
              praise={selectedPraise}
              onClose={() => setIsDuplicateDialogOpen(false)}
              onSelect={handleDuplicate}
            />
          </Dialog>
        </React.Suspense>
      </tbody>
    </table>
  );
};

export default QuantifyTable;
