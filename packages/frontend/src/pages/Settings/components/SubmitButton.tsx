import { isApiResponseOk } from '@/model/api';
import { CreatePeriodApiResponse } from '@/model/periods';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFormState } from 'react-final-form';
import { useRecoilValue } from 'recoil';

const SubmitButton = () => {
  const { invalid, submitting, submitSucceeded, dirtySinceLastSubmit } =
    useFormState();
  const apiResponse = useRecoilValue(CreatePeriodApiResponse);

  const disabled =
    invalid || submitting || (submitSucceeded && !dirtySinceLastSubmit);

  const className = disabled ? 'praise-button-disabled' : 'praise-button';

  return (
    <button
      type="submit"
      id="submit-button"
      className={className}
      disabled={disabled}
    >
      {apiResponse && isApiResponseOk(apiResponse) ? (
        <>
          <FontAwesomeIcon
            icon={faCheckCircle}
            size="1x"
            className="inline-block mr-2"
          />
          Setting saved
        </>
      ) : submitting ? (
        'Saving…'
      ) : (
        'Save settings'
      )}
    </button>
  );
};

export default SubmitButton;
