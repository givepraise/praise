import { classNames } from '@/utils/index';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface InlineLabelProps {
  text: string;
  button?: any;
  className?: string;
}
const InlineLabel = ({ text, button, className }: InlineLabelProps) => {
  return (
    <span
      className={classNames(
        className,
        'h-6 pl-1 pr-1 mr-1 text-xs text-white no-underline bg-gray-800 py-[1px] rounded'
      )}
    >
      {text}
      {button && button}
    </span>
  );
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

const QuantifyTable = () => {
  return null;
  // // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  // const { periodId, receiverId } = useParams() as any;
  // usePeriodPraiseQuery(periodId);
  // const userId = useRecoilValue(ActiveUserId);
  // const data = useRecoilValue(
  //   PeriodActiveQuantifierReceiverPraise({ periodId, receiverId })
  // );
  // const usePseudonyms = useRecoilValue(
  //   SingleBooleanSetting('PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS')
  // );
  // const { quantify } = useQuantifyPraise();

  // const [isDismissDialogOpen, setIsDismissDialogOpen] = React.useState(false);
  // const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] =
  //   React.useState(false);
  // const [selectedPraise, setSelectedPraise] = React.useState<
  //   PraiseDto | undefined
  // >(undefined);

  // if (!data) return null;

  // const quantification = (praise: PraiseDto) => {
  //   return praise.quantifications!.find((q) => q.quantifier === userId);
  // };

  // const dismissed = (praise: PraiseDto) => {
  //   const q = quantification(praise);
  //   return q ? !!q.dismissed : false;
  // };

  // const duplicate = (praise: PraiseDto) => {
  //   const q = quantification(praise);
  //   return q ? (q.duplicatePraise ? true : false) : false;
  // };

  // const handleDismiss = () => {
  //   void quantify(selectedPraise._id, 0, true, null);
  // };

  // const handleDuplicate = (duplicatePraiseId: string) => {
  //   void quantify(selectedPraise._id, 0, false, duplicatePraiseId);
  // };

  // const handleRemoveDismiss = (id: string) => {
  //   void quantify(selectedPraise._id, 0, false, null);
  // };

  // const handleRemoveDuplicate = (id: string) => {
  //   void quantify(selectedPraise._id, 0, false, null);
  // };

  // return (
  //   <>
  //     <table className="w-full table-auto">
  //       <tbody>
  //         {data.map((praise, index) => {
  //           if (!praise) return null;
  //           return (
  //             <tr key={index} onMouseDown={() => setSelectedPraise(praise)}>
  //               <td>
  //                 <div className="items-center w-full">
  //                   <div className="flex items-center">
  //                     <UserAvatar userAccount={praise.giver} />
  //                   </div>
  //                 </div>
  //               </td>
  //               <td>
  //                 <div>
  //                   <span className="font-bold">
  //                     {usePseudonyms ? (
  //                       <UserPseudonym
  //                         userId={praise.giver._id!}
  //                         periodId={periodId}
  //                       />
  //                     ) : (
  //                       praise.giver.username
  //                     )}
  //                   </span>
  //                   <span className="ml-2 text-xs text-gray-500">
  //                     {formatDate(praise.createdAt)}
  //                   </span>
  //                 </div>
  //                 <div className="w-[550px] overflow-hidden overflow-ellipsis">
  //                   <span>
  //                     <InlineLabel
  //                       text={`#${praise._id.slice(-4)}`}
  //                       className="bg-gray-400"
  //                     />
  //                     {dismissed(praise) ? (
  //                       <>
  //                         <InlineLabel
  //                           text="Dismissed"
  //                           button={getRemoveButton(handleRemoveDismiss)}
  //                           className="bg-red-600"
  //                         />
  //                         <span className="line-through">{praise.reason}</span>
  //                       </>
  //                     ) : duplicate(praise) ? (
  //                       <>
  //                         <InlineLabel
  //                           // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  //                           text={`Duplicate of: #${quantification(
  //                             praise
  //                           )!.duplicatePraise?.slice(-4)}`}
  //                           button={getRemoveButton(handleRemoveDuplicate)}
  //                         />
  //                         <span className="text-gray-400">{praise.reason}</span>
  //                       </>
  //                     ) : (
  //                       praise.reason
  //                     )}
  //                   </span>
  //                 </div>
  //               </td>
  //               <td>
  //                 <div className="flex">
  //                   <QuantifySlider praise={praise} />
  //                   <button
  //                     className="pb-1 ml-4 hover:text-gray-400"
  //                     disabled={duplicate(praise)}
  //                     onClick={() => setIsDuplicateDialogOpen(true)}
  //                   >
  //                     <FontAwesomeIcon
  //                       icon={faCopy}
  //                       size="1x"
  //                       className={duplicate(praise) ? 'text-gray-400' : ''}
  //                     />
  //                   </button>
  //                   <button
  //                     className="pb-1 ml-1 hover:text-gray-400"
  //                     disabled={dismissed(praise)}
  //                     onClick={() => setIsDismissDialogOpen(true)}
  //                   >
  //                     <FontAwesomeIcon
  //                       icon={faTimesCircle}
  //                       size="1x"
  //                       className={dismissed(praise) ? 'text-gray-400' : ''}
  //                     />
  //                   </button>
  //                 </div>
  //               </td>
  //             </tr>
  //           );
  //         })}

  //         <React.Suspense fallback={null}>
  //           <Dialog
  //             open={isDismissDialogOpen && !!selectedPraise}
  //             onClose={() => setIsDismissDialogOpen(false)}
  //             className="fixed inset-0 z-10 overflow-y-auto"
  //           >
  //             <DismissDialog
  //               praise={selectedPraise}
  //               onClose={() => setIsDismissDialogOpen(false)}
  //               onDismiss={() => handleDismiss()}
  //             />
  //           </Dialog>
  //         </React.Suspense>

  //         <React.Suspense fallback={null}>
  //           <Dialog
  //             open={isDuplicateDialogOpen}
  //             onClose={() => setIsDuplicateDialogOpen(false)}
  //             className="fixed inset-0 z-10 overflow-y-auto"
  //           >
  //             <DuplicateDialog
  //               praise={selectedPraise}
  //               onClose={() => setIsDuplicateDialogOpen(false)}
  //               onSelect={handleDuplicate}
  //             />
  //           </Dialog>
  //         </React.Suspense>
  //       </tbody>
  //     </table>
  //     <QuantifyBackNextLink />
  //   </>
  // );
};

export default QuantifyTable;
