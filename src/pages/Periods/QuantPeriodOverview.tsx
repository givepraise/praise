import React, {
   MouseEvent,
   ChangeEventHandler,
   RefObject, 
   useRef, 
   useState
} from 'react';

export interface QuantPeriodOverviewProps {
    periodName: string;
    periodStart: string;
    periodEnd: string;
    onWordAdd?: (value: string | undefined) => void;
}


const QuantPeriodOverview = ({
    periodName,
    periodStart,
    periodEnd,
    onWordAdd,
}: QuantPeriodOverviewProps) => {
    const inputEl: RefObject<HTMLInputElement> | null = useRef(null);
    const [newWord, setNewWord] = useState('');
    const [disable, setDisable] = useState(true);

   const handleUpdatePeriodNameClick = (e: MouseEvent<HTMLButtonElement>) => {
       onWordAdd?.(newWord);
       setNewWord('');
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
               id="period-name-input"
               required
               ref={inputEl}
               placeholder={periodName}
               value={newWord}
               onChange={onChange}
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
