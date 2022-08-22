import { Field } from 'react-final-form';

export const ImageFileInput = (
  name: string,
  src: string | undefined,
  disabled?: boolean
): JSX.Element => {
  return (
    <Field<FileList> name={name} key={name}>
      {({ input: { onChange, onBlur, onFocus } }): JSX.Element => (
        <div>
          <input
            onBlur={onBlur}
            onFocus={onFocus}
            id={name}
            type="file"
            className="block w-full"
            onChange={({ target }): void => onChange(target.files)}
            disabled={disabled || false}
          />

          <div className="mt-2">
            {src ? (
              <img src={src} className="block w-auto h-48" />
            ) : (
              <div className="block w-auto h-48 bg-warm-gray-300 "></div>
            )}
          </div>
        </div>
      )}
    </Field>
  );
};
