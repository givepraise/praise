import React, {
  KeyboardEvent,
  ChangeEventHandler,
  RefObject, 
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
import ApiErrorMessage from "@/components/periods/create/ApiErrorMessage";
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
  const [newWord, setNewWord] = useState(`${periodName}`);
  const { updatePeriod } = useUpdatePeriod();
  const [wordIsValid, setWordIsValid] = useState(true);
  const [submitSucceeded, setSubmitSucceeded] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultMessageVisible, setResultMessageVisible] = useState(false);
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

  const SubmitResultMessage = (result:string) => { 
    if (result === 'ok') {
      setResultMessage("Name changed successfully")
    } else {
      setResultMessage(result)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter" || e.code === "Tab") {
      if (wordIsValid) {
        const updateResult = updatePeriodName(newWord, periodId);
        SubmitResultMessage('ok')
      }
      setResultMessageVisible(true);
    } else if (e.code === "Escape") {
      setNewWord(`${periodName}`);
    }
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = ({currentTarget: {value}}) => {
    setResultMessageVisible(false);
    setNewWord(value);
    // A word is valid if it has more than a single char and has no spaces
    const isTooShort: boolean = value.length < 3 ;
    const isTooLong: boolean = value.length > 64;
    setWordIsValid(!isTooShort && !isTooLong);
    if (isTooLong) {
      SubmitResultMessage('Name must be less than 64 characters');
    } else if (isTooShort) {
      SubmitResultMessage('Name must be more than 3 characters');
    }
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
            value={newWord}
            onChange={onChange}
            onKeyDown={handleKeyDown}
          />
        </OutsideClickHandler>
        <p 
          role="alert"
          id="period-update-result">
            {resultMessageVisible && resultMessage}
        </p>
      <div>
      Period Start: {periodStart}
      <br />
      Period End: {periodEnd}
      </div>
    </div>
  );
};

export default QuantPeriodOverview;
