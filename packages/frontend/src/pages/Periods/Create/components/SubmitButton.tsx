import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFormState } from 'react-final-form';
import { useRecoilValue } from 'recoil';
import { CreatePeriodApiResponse } from '@/model/periods';
import { isResponseOk } from '@/model/api';

export const SubmitButton = (): JSX.Element => {
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
      {apiResponse && isResponseOk(apiResponse) ? (
        <>
          <FontAwesomeIcon
            icon={faCheckCircle}
            size="1x"
            className="inline-block mr-2"
          />
          Period created
        </>
      ) : submitting ? (
        'Creating…'
      ) : (
        'Create period'
      )}
    </button>
  );
};
