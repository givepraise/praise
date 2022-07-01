import React from 'react';
import { useFormState } from 'react-final-form';

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

  const className = disabled ? 'praise-button-disabled' : 'praise-button';

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
    <button
      type="submit"
      id="submit-button"
      className={className}
      disabled={disabled}
    >
      {buttonText}
    </button>
  );
};
