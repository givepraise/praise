import { Field } from 'react-final-form';

const StringInput = (name: string): JSX.Element => {
  return (
    <Field name={name} key={name}>
      {({ input }): JSX.Element => {
        return (
          <div>
            <input
              type="text"
              id={name}
              {...input}
              autoComplete="off"
              className="block w-full"
            />
          </div>
        );
      }}
    </Field>
  );
};

export default StringInput;
