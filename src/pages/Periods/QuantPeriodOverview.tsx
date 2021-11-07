import React, {
   MouseEvent,
   KeyboardEvent,
   ChangeEventHandler,
   RefObject, 
   useRef, 
   useState
} from 'react';
import { useHistory } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { isApiResponseOk } from "@/store/api";
import {
  UpdatePeriodApiResponse,
  Period,
  useUpdatePeriod,
} from "@/store/periods";

export interface QuantPeriodOverviewProps {
    periodId: number | undefined;
    periodName: string;
    periodStart: string;
    periodEnd: string;
    onWordAdd?: (value: string | undefined) => void;
}

const QuantPeriodOverview = ({
    periodId,
    periodName,
    periodStart,
    periodEnd,
    onWordAdd,
}: QuantPeriodOverviewProps) => {
    const inputEl: RefObject<HTMLInputElement> | null = useRef(null);
    const [newWord, setNewWord] = useState('');
    const { updatePeriod } = useUpdatePeriod();
    const [disable, setDisable] = useState(true);
    const setApiResponse = useSetRecoilState(UpdatePeriodApiResponse);

    const history = useHistory();

    // Is only called if validate is successful
    const UpdatePeriodName = async (values: string, periodId: number | undefined) => {
        // Clear any old API error messages
        setApiResponse(null);

        const dateString = "not needed"
        const updatedPeriod: Period = {
          id: periodId,
          name: values,
          endDate: dateString,
        };

        const response = await updatePeriod(updatedPeriod);
        if (isApiResponseOk(response)) {
          setTimeout(() => {
            history.goBack();
          }, 1000);
        }
    };

   const handleUpdatePeriodNameClick = (e: MouseEvent<HTMLButtonElement>) => {
       onWordAdd?.(newWord);
       setNewWord('');
   };

   const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.code === "Enter") {
            onWordAdd?.(newWord);
            UpdatePeriodName(newWord, periodId);
            setNewWord('');
        } else if (e.code === "Escape") {
            setNewWord('');
        } else {
            return;
        }
    };

  const onChange: ChangeEventHandler<HTMLInputElement> = ({currentTarget: {value}}) => {
       setNewWord(value);
       // A word is valid if it has more than a single char and has no spaces
       const isInvalidWord: boolean = value.length < 2 || /\s/.test(value);
       setDisable(isInvalidWord);
   };

   return (
       <div>
            <h2>Period Overview</h2>
            <br />
            <label htmlFor="period-name-input">Name  </label>
            <input
               type="text"
               name="period-name"
               className="praise-text-input"
               id="period-name-input"
               required
               ref={inputEl}
               placeholder={periodName}
               value={newWord}
               onChange={onChange}
               onKeyDown={handleKeyDown}
            />
            <button 
                className="praise-button" 
                onClick={handleUpdatePeriodNameClick}
                disabled={disable}>
                    Update
            </button>
            <br />
            <br />
            Period Start: {periodStart}
            <br />
            <br />
            Period End: {periodEnd}

       </div>
   );
};

export default QuantPeriodOverview;
