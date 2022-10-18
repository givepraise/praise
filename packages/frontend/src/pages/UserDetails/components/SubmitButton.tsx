import {
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFormState } from 'react-final-form';
import React from 'react';
import { Button } from '@/components/ui/Button';

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
    <>Update profile</>
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
              Profile updated
            </>
          ),
        1000
      );
    }
  }, [submitSucceeded]);

  React.useEffect(() => {
    if (submitting) {
      setButtonText(<>Updating</>);
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
          Update error
        </>
      );
    }
  }, [hasSubmitErrors]);

  React.useEffect(() => {
    if (dirtySinceLastSubmit) {
      setButtonText(<>Update Profile</>);
    }
  }, [dirtySinceLastSubmit]);

  return (
    <Button type="submit" id="submit-button" disabled={disabled}>
      {buttonText}
    </Button>
  );
};
