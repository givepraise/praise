import React from "react";
import RangeSlider from "../RangeSlider";
import { getPraiseMarks } from "@/utils/index";
import { Dialog } from "@headlessui/react";
import DismissDialog from "@/components/quantify/DismissDialog";
import DuplicateDialog from "@/components/quantify/DuplicateDialog";

const praises = [
  {
    id: 1,
    from: 'Blue Apron',
    date: '2021-08-10',
    praise: 'For being a badass person in general',
    quantify_value: 1,
    duplicate_of: '#1002 (x)',
    dismissed: false
  },
  {
    id: 2,
    from: 'Stingy Stingray',
    date: '2021-08-11',
    praise: 'for doing all that hard work you did with marketing campaign thing',
    quantify_value: 1,
    duplicate_of: null,
    dismissed: true
  }
];

const QuantifyTable = () => {
  let [isDismissDialogOpen, setIsDismissDialogOpen] = React.useState(false);
  let [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = React.useState(false);
  let [selectedPraise, setSelectedPraise] = React.useState<any>();  

  const handleChange = (value: number) => {
    /** TODO: update praise by Id (saved in selectedPraise) */
  }

  const handleDismiss = (id: number) => {
    /** TODO: dismiss praise */
  }

  const handleDuplicate = (id: number, fid: number) => {
    /** TODO: mark as duplicate */
  }

  return (
    <table className="w-full table-auto">      
      <tbody>                  
         {praises.map(( praise, index ) => {
          return (
            <tr key={index} onMouseDown={() => setSelectedPraise(praise)}>
              <td>{praise.id}</td>
              <td>{praise.from}</td>
              <td>{praise.date}</td>
              <td>
                <div className="flex space-x-1">
                  {
                    !!praise.dismissed ?
                      <div className="bg-black text-white text-sm">Dismissed</div>
                    : <div></div>
                  }
                  <div className={(!!praise.dismissed ? 'line-through' : '')}>{praise.praise}</div>
                </div>
              </td>
              <td>
                <div className="flex space-x-4">
                  <RangeSlider marks={getPraiseMarks()} defaultValue={praise.quantify_value} onValueChanged={(value: number) => handleChange(value)}></RangeSlider>
                  <button className="praise-button text-xs px-2 py-2" onClick={() => setIsDuplicateDialogOpen(true)}>
                    Duplicate
                  </button>
                  <button className="praise-button text-xs px-2 py-2" onClick={() => setIsDismissDialogOpen(true)}>
                    Dismiss
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
            <DismissDialog praise={selectedPraise} onClose={() => setIsDismissDialogOpen(false)} onDismiss={(id: number) => handleDismiss(id)} />
          </Dialog>          
        </React.Suspense>

        <React.Suspense fallback={null}>
          <Dialog
            open={isDuplicateDialogOpen}
            onClose={() => setIsDuplicateDialogOpen(false)}
            className="fixed inset-0 z-10 overflow-y-auto"
          >
            <DuplicateDialog praise={selectedPraise} onClose={() => setIsDuplicateDialogOpen(false)} onDuplicate={(id: number, fid: number) => handleDuplicate(id, fid)} />
          </Dialog>          
        </React.Suspense>
      </tbody>
    </table>
  );
};

export default QuantifyTable;
