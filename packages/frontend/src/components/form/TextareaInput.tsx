import { Field } from 'react-final-form';

const TextareaInput = (name: string): JSX.Element => {
  return (
    <Field name={name} key={name}>
      {({ input }): JSX.Element => (
        <div>
          <textarea
            type="text"
            id={name}
            {...input}
            autoComplete="off"
            className="block w-full resize-y"
            rows={4}
          />
        </div>
      )}
    </Field>
  );
};

export default TextareaInput;
