import { Field } from 'react-final-form';

const ImageFileInput = (name: string, src: string | undefined): JSX.Element => {
  return (
    <Field<FileList> name={name} key={name}>
      {({ input: { value, onChange, ...input } }): JSX.Element => (
        <div>
          <input
            {...input}
            id={name}
            type="file"
            className="block w-full"
            onChange={({ target }): void => onChange(target.files)}
          />

          <div className="mt-2">
            {src ? (
              <img src={src} className="w-auto h-48 block" />
            ) : (
              <div className="w-auto h-48 block bg-gray-300 "></div>
            )}
          </div>
        </div>
      )}
    </Field>
  );
};

export default ImageFileInput;
