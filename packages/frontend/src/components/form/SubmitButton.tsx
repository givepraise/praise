import React from 'react';
import { useFormState } from 'react-final-form';
import { PraiseButton } from '../ui/PraiseButton';

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

  const variant = disabled ? 'disabled' : '';

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
    <PraiseButton id="submit-button" type="submit" variant={variant}>
      {buttonText}
    </PraiseButton>
  );
};
