import DismissDialog from "@/components/QuantifyPeriodUser/DismissDialog";
import DuplicateDialog from "@/components/QuantifyPeriodUser/DuplicateDialog";
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
import RangeSlider from "../RangeSlider";

const praises = [
  {
    id: 1001,
    from: "Blue Apron",
    date: "2021-08-10",
    praise: "For being a badass person in general",
    quantify_value: 55,
    duplicate_of: null,
    dismissed: false,
  },
  {
    id: 1002,
    from: "Stingy Stingray",
    date: "2021-08-11",
    praise:
      "for doing all that hard work you did with marketing campaign thing",
    quantify_value: 0,
    duplicate_of: null,
    dismissed: true,
  },
  {
    id: 1003,
    from: "Weirdo Loudmouth",
    date: "2021-08-16",
    praise:
      "for developing and testing the smart contracts. They are actually hosting a demo of the augmented bonding curve and all the commons upgrade tooling. Much admiration and respect for that",
    quantify_value: 0,
    duplicate_of: 1001,
    dismissed: false,
  },
  {
    id: 1001,
    from: "Savage Fairbottom",
    date: "2021-08-19",
    praise:
      "for the pollen bot meeting turned into mini hack session and for being so engaged in adapting the 1hive pollen bot to our needs.",
    quantify_value: 144,
    duplicate_of: null,
    dismissed: false,
  },
];

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
  let [isDismissDialogOpen, setIsDismissDialogOpen] = React.useState(false);
  let [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = React.useState(false);
  let [selectedPraise, setSelectedPraise] = React.useState<any>();

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

  return (
    <table className="w-full table-auto">
      <tbody>
        {praises.map((praise, index) => {
          return (
            <tr key={index} onMouseDown={() => setSelectedPraise(praise)}>
              <td>
                <div className="flex items-center w-full">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faUserCircle} size="2x" />
                  </div>
                  <div className="flex-grow p-3 whitespace-nowrap">
                    #{praise.id}, {praise.date}
                    <br />
                    {praise.from}
                  </div>
                </div>
              </td>
              <td>
                <div className="flex space-x-1">
                  {praise.dismissed ? (
                    <span>
                      <InlineLabel
                        text="Dismissed"
                        button={getRemoveButton(handleRemoveDismiss)}
                      />
                      <span className="line-through">{praise.praise}</span>
                    </span>
                  ) : praise.duplicate_of != null ? (
                    <span>
                      <InlineLabel
                        text={`Duplicate of: #${praise.duplicate_of}`}
                        button={getRemoveButton(handleRemoveDuplicate)}
                      />
                      <span className="line-through">{praise.praise}</span>
                    </span>
                  ) : (
                    praise.praise
                  )}
                </div>
              </td>
              <td>
                <div className="flex space-x-3">
                  <RangeSlider
                    marks={getPraiseMarks()}
                    defaultValue={praise.quantify_value}
                    onValueChanged={(value: number) => handleChange(value)}
                    disabled={
                      praise.dismissed || praise.duplicate_of ? true : false
                    }
                  ></RangeSlider>
                  <button onClick={() => setIsDuplicateDialogOpen(true)}>
                    <FontAwesomeIcon icon={faCopy} size="1x" />
                  </button>
                  <button onClick={() => setIsDismissDialogOpen(true)}>
                    <FontAwesomeIcon icon={faTimesCircle} size="1x" />
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
