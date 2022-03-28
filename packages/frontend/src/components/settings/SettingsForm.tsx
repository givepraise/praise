import FieldErrorMessage from '@/components/form/FieldErrorMessage';
import {
  ImageSettingFullPath,
  SetSettingApiResponse,
  StringSetting,
} from '@/model/settings';
import { Field, Form } from 'react-final-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import SubmitButton from '../form/SubmitButton';

interface SettingsFormProps {
  settings: StringSetting[] | undefined;
  setSetting: Function;
}

const SettingsForm = ({
  settings,
  setSetting,
}: SettingsFormProps): JSX.Element | null => {
  const [apiResponse] = useRecoilState(SetSettingApiResponse);

  // Is only called if validate is successful
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: Record<string, any>): Promise<void> => {
    for (const prop in values) {
      if (Object.prototype.hasOwnProperty.call(values, prop)) {
        const setting = settings?.find((s) => s.key === prop);
        if (setting && values[prop].toString() !== setting.value) {
          const item =
            setting.type === 'Image' ? values[prop][0] : values[prop];

          const updatedSetting = {
            ...setting,
            value: item,
          } as StringSetting;

          await setSetting(updatedSetting);
        }
      }
    }
  };

  const getStringInput = (setting: StringSetting): JSX.Element => {
    return (
      <Field name={setting.key} key={setting.key}>
        {({ input }): JSX.Element => {
          return (
            <div>
              <input
                type="text"
                id={setting.key}
                {...input}
                autoComplete="off"
                className="block w-full"
              />
              {apiResponse && (
                <FieldErrorMessage name="name" apiResponse={apiResponse} />
              )}
            </div>
          );
        }}
      </Field>
    );
  };

  const getNumberInput = (setting: StringSetting): JSX.Element => {
    return (
      <Field name={setting.key} key={setting.key}>
        {({ input }): JSX.Element => (
          <div>
            <input
              type="number"
              id={setting.key}
              {...input}
              autoComplete="off"
              className="block w-full"
            />
            {apiResponse && (
              <FieldErrorMessage name="name" apiResponse={apiResponse} />
            )}
          </div>
        )}
      </Field>
    );
  };

  const getTextareaInput = (setting: StringSetting): JSX.Element => {
    return (
      <Field name={setting.key} key={setting.key}>
        {({ input }): JSX.Element => (
          <div>
            <textarea
              type="text"
              id={setting.key}
              {...input}
              autoComplete="off"
              className="block w-full resize-y "
            />
            {apiResponse && (
              <FieldErrorMessage name="name" apiResponse={apiResponse} />
            )}
          </div>
        )}
      </Field>
    );
  };

  interface ImagePreviewProps {
    settingsKey: string;
  }
  const ImagePreview = ({ settingsKey }: ImagePreviewProps): JSX.Element => {
    const imagePath = useRecoilValue(ImageSettingFullPath(settingsKey));
    return (
      <div className="mt-2">
        <img src={imagePath} width="100" height="100" />
      </div>
    );
  };

  const getFileInput = (setting: StringSetting): JSX.Element => {
    return (
      <Field<FileList> name={setting.key} key={setting.key}>
        {({ input: { value, onChange, ...input } }): JSX.Element => (
          <div>
            <input
              {...input}
              id={setting.key}
              type="file"
              className="block w-full"
              onChange={({ target }): void => onChange(target.files)}
            />
            <ImagePreview settingsKey={setting.key} />
          </div>
        )}
      </Field>
    );
  };

  const getBooleanInput = (setting: StringSetting): JSX.Element => {
    return (
      <Field name={setting.key} key={setting.key} type="checkbox">
        {({ input }): JSX.Element => {
          return (
            <div>
              <input id={setting.key} {...input} />
              {apiResponse && (
                <FieldErrorMessage name="name" apiResponse={apiResponse} />
              )}
            </div>
          );
        }}
      </Field>
    );
  };

  const getField = (setting: StringSetting): JSX.Element | null => {
    let field;
    if (setting.type === 'String' || setting.type === 'List')
      field = getStringInput(setting);
    else if (setting.type === 'Number') field = getNumberInput(setting);
    else if (setting.type === 'Textarea') field = getTextareaInput(setting);
    else if (setting.type === 'Boolean') field = getBooleanInput(setting);
    else if (setting.type === 'Image') field = getFileInput(setting);

    if (!field) return null;

    return (
      <div className="mb-4" key={setting.key}>
        <label className="block font-bold">{setting.label}</label>
        {setting.description && (
          <div className="mb-2 text-sm font-bold text-gray-400">
            {setting.description}
          </div>
        )}
        {field}
      </div>
    );
  };

  if (!Array.isArray(settings) || settings.length === 0) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialValues = {} as any;
  for (const setting of settings) {
    initialValues[setting.key] =
      setting.type === 'Boolean' ? setting.value === 'true' : setting.value;
  }

  return (
    <Form
      onSubmit={onSubmit}
      encType="multipart/form-data"
      initialValues={initialValues}
      mutators={{
        setDate: (args, state, utils): void => {
          utils.changeValue(state, 'endDate', () => args);
        },
      }}
      render={({ handleSubmit }): JSX.Element => (
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        <form onSubmit={handleSubmit} className="leading-loose">
          <div className="mb-3">
            {settings.map((setting: StringSetting) => getField(setting))}
          </div>
          <div className="mt-2">
            <SubmitButton />
          </div>
        </form>
      )}
    />
  );
};

export default SettingsForm;
