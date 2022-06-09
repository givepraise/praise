import { Field } from 'react-final-form';

const BooleanInput = (name: string): JSX.Element => {
  return (
    <Field name={name} key={name} type="checkbox">
      {({ input }): JSX.Element => {
        return (
          <div>
            <input id={name} {...input} />
          </div>
        );
      }}
    </Field>
  );
};

export default BooleanInput;
