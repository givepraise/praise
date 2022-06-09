import { Field } from 'react-final-form';

const NumberInput = (name: string): JSX.Element => {
  return (
    <Field name={name} key={name}>
      {({ input }): JSX.Element => (
        <div>
          <input
            type="number"
            id={name}
            {...input}
            autoComplete="off"
            className="block w-full"
          />
        </div>
      )}
    </Field>
  );
};

export default NumberInput;
