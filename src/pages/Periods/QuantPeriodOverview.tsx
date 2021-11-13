import React, {
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
import OutsideClickHandler from 'react-outside-click-handler';

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
    const [newWord, setNewWord] = useState(`${periodName}`);
    const { updatePeriod } = useUpdatePeriod();
    const [valid, setValid] = useState(true);
    const setApiResponse = useSetRecoilState(UpdatePeriodApiResponse);

    const history = useHistory();

    // Is only called if validate is successful
    const updatePeriodName = async (values: string, periodId: number | undefined) => {
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
            history.replace("/periods/" + periodId);
          }, 1000);
        }
    };

   const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.code === "Enter" || e.code === "Tab") {
            if (valid) {
                updatePeriodName(newWord, periodId);
            }
        } else if (e.code === "Escape") {
            setNewWord(`${periodName}`);
        } else {
            return;
        }
    };

  const onChange: ChangeEventHandler<HTMLInputElement> = ({currentTarget: {value}}) => {
       setNewWord(value);
       // A word is valid if it has more than a single char and has no spaces
       const isInvalidWord: boolean = value.length < 3 || /\s/.test(value);
       setValid(!isInvalidWord);
   };

   const handleClickOutside = () => {
        setNewWord(`${periodName}`);
   }

   return (
       <div>
            <h2>Period Overview</h2>
            <br />
                <label htmlFor="period-name-input">Name  </label>
                <OutsideClickHandler onOutsideClick={handleClickOutside}>
                    <input
                       type="text"
                       name="period-name"
                       className="pl-0 text-xl font-semibold bg-transparent border-0"
                       id="period-name-input"
                       required
                       ref={inputEl}
                       value={newWord}
                       onChange={onChange}
                       onKeyDown={handleKeyDown}
                    />
                </OutsideClickHandler>
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
