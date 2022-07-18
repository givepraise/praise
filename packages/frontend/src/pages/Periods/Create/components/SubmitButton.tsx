import {
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFormState } from 'react-final-form';
import React from 'react';

export const SubmitButton = (): JSX.Element => {
  const {
    hasValidationErrors,
    submitting,
    submitSucceeded,
    submitFailed,
    dirtySinceLastSubmit,
    hasSubmitErrors,
  } = useFormState();

  const disabled =
    hasValidationErrors ||
    submitting ||
    (submitSucceeded && !dirtySinceLastSubmit) ||
    (submitFailed && !dirtySinceLastSubmit);

  const [buttonText, setButtonText] = React.useState<JSX.Element>(
    <>Create period</>
  );

  React.useEffect(() => {
    if (submitSucceeded) {
      setTimeout(
        () =>
          setButtonText(
            <>
              <FontAwesomeIcon
                icon={faCheckCircle}
                size="1x"
                className="inline-block mr-2"
              />
              Period created
            </>
          ),
        1000
      );
    }
  }, [submitSucceeded]);

  React.useEffect(() => {
    if (submitting) {
      setButtonText(<>Creating…</>);
    }
  }, [submitting]);

  React.useEffect(() => {
    if (hasSubmitErrors) {
      setButtonText(
        <>
          <FontAwesomeIcon
            icon={faTimesCircle}
            size="1x"
            className="inline-block mr-2"
          />
          Create error
        </>
      );
    }
  }, [hasSubmitErrors]);

  React.useEffect(() => {
    if (dirtySinceLastSubmit) {
      setButtonText(<>Create period</>);
    }
  }, [dirtySinceLastSubmit]);

  return (
    <button
      type="submit"
      id="submit-button"
      disabled={disabled}
      className={disabled ? 'praise-button-disabled' : 'praise-button'}
    >
      {buttonText}
    </button>
  );
};
