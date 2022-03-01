import { isResponseOk } from '@/model/api';
import { SetSettingApiResponse } from '@/model/settings';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFormState } from 'react-final-form';
import { useRecoilValue } from 'recoil';

const SubmitButton = (): JSX.Element => {
  const {
    invalid,
    submitting,
    submitSucceeded,
    dirtySinceLastSubmit,
    pristine,
  } = useFormState();
  const apiResponse = useRecoilValue(SetSettingApiResponse);

  const disabled =
    pristine ||
    invalid ||
    submitting ||
    (submitSucceeded && !dirtySinceLastSubmit);

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
