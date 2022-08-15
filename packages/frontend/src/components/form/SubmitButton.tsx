import React from 'react';
import { useFormState } from 'react-final-form';
import { Button } from '../ui/Button';

export const SubmitButton = (): JSX.Element => {
  const {
    invalid,
    submitting,
    submitSucceeded,
    dirtySinceLastSubmit,
    pristine,
  } = useFormState();

  const disabled =
    pristine ||
    invalid ||
    submitting ||
    (submitSucceeded && !dirtySinceLastSubmit);

  const [buttonText, setButtonText] = React.useState<string>('Save settings');

  React.useEffect(() => {
    if (submitSucceeded) {
      setTimeout(() => setButtonText('Save settings'), 1000);
    }
    if (submitting) {
      setButtonText('Saving…');
    }
  }, [submitSucceeded, submitting]);

  return (
    <Button id="submit-button" type="submit" disabled={disabled}>
      {buttonText}
    </Button>
  );
};
