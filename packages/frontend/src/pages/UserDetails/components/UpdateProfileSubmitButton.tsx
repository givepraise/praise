import { faCheck, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFormState } from 'react-final-form';
import React from 'react';
import { Button } from '@/components/ui/Button';

export const UpdateProfileSubmitButton = (): JSX.Element => {
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

  const [buttonText, setButtonText] = React.useState<JSX.Element>(<>Save</>);

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
    <div className="text-center">
      <Button type="submit" id="submit-button" disabled={disabled}>
        <FontAwesomeIcon className="mr-2" icon={faCheck} size="1x" />
        {buttonText}
      </Button>
    </div>
  );
};
