import DismissDialog from "@/components/QuantifyPeriodUser/DismissDialog";
import DuplicateDialog from "@/components/QuantifyPeriodUser/DuplicateDialog";
import { ActiveUserId } from "@/model/auth";
import { PeriodPraise } from "@/model/periods";
import { Praise } from "@/model/praise";
import { formatDate } from "@/utils/date";
import { getPraiseMarks } from "@/utils/index";
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
import RangeSlider from "../RangeSlider";

interface InlineLabelProps {
  text: string;
  button: any;
}
const InlineLabel = ({ text, button }: InlineLabelProps) => {
  return (
    <span className="h-6 pl-1 pr-1 mr-1 text-xs text-white no-underline bg-black py-[1px] rounded">
      {text}
      {button}
    </span>
  );
};

const QuantifyTable = () => {
  const { periodId, receiverId } = useParams() as any;
  const userId = useRecoilValue(ActiveUserId);

  let [isDismissDialogOpen, setIsDismissDialogOpen] = React.useState(false);
  let [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = React.useState(false);
  let [selectedPraise, setSelectedPraise] = React.useState<any>();

  const data = useRecoilValue(PeriodPraise(periodId));

  const handleChange = (value: number) => {
    /** TODO: update praise by Id (saved in selectedPraise) */
  };

  const handleDismiss = (id: number) => {
    /** TODO: dismiss praise */
  };

  const handleDuplicate = (id: number, fid: number) => {
    /** TODO: mark as duplicate */
  };

  const handleRemoveDismiss = (id: number) => {
    /** TODO: handle remove dismiss */
  };

  const handleRemoveDuplicate = (id: number) => {
    /** TODO: handle remove duplicate */
  };

  const getRemoveButton = (action: any) => {
    return (
      <button onClick={action} className="ml-2">
        <FontAwesomeIcon
          className="text-gray-400 hover:text-white"
          icon={faTimes}
          size="1x"
        />
      </button>
    );
  };

  if (!data) return null;

  const filteredData = data.filter(
    (praise) =>
      praise.quantifications!.findIndex(
        (quant) => quant.quantifier === userId
      ) >= 0 && praise.receiver._id! === receiverId
  );

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
    return q ? (q.score ? q.score : 0) : 0;
  };

  return (
    <table className="w-full table-auto">
      <tbody>
        {filteredData.map((praise, index) => {
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
                    {praise.giver.username}
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
                      />
                      <span className="line-through">{praise.reason}</span>
                    </span>
                  ) : duplicate(praise) ? (
                    <span>
                      <InlineLabel
                        text={`Duplicate of: #${
                          quantification(praise)!.duplicatePraise
                        }`}
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
              onDismiss={(id: number) => handleDismiss(id)}
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
              onDuplicate={(id: number, fid: number) =>
                handleDuplicate(id, fid)
              }
            />
          </Dialog>
        </React.Suspense>
      </tbody>
    </table>
  );
};

export default QuantifyTable;
