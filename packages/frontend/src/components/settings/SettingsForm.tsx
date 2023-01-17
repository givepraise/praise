/* eslint-disable @typescript-eslint/no-misused-promises */
import { Form } from 'react-final-form';
import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NumberInput } from '@/components/form/NumberInput';
import { StringInput } from '@/components/form/StringInput';
import { TextareaInput } from '@/components/form/TextareaInput';
import { BooleanInput } from '@/components/form/BooleanInput';
import { ImageFileInput } from '@/components/form/ImageFileInput';
import { Notice } from '@/components/ui/Notice';
import { SubmitButton } from '../form/SubmitButton';
import { RadioInput } from '../form/RadioInput';
import { SettingDto } from '@/model/settings/dto/setting.dto';
import { PeriodSettingDto } from '@/model/periodsettings/dto/period-settings.dto';

interface SettingsFormProps {
  settings: SettingDto[] | undefined;
  parentOnSubmit(
    setting: SettingDto
  ): Promise<
    | AxiosResponse<SettingDto>
    | AxiosResponse<PeriodSettingDto>
    | AxiosError
    | undefined
  >;
  disabled?: boolean;
}

const FormFields = (
  settings: SettingDto[] | PeriodSettingDto[],
  apiResponse,
  setValue: (key: string, value: string) => void,
  disabled?: boolean
): JSX.Element => {
  return (
    <div className="mb-2 space-y-4">
      {settings.map((setting) => {
        const SettingDescription = (): JSX.Element => (
          <div className="mb-2 text-sm text-warm-gray-400">
            {setting.description}
          </div>
        );
        return (
          <div key={setting.key}>
            <label className="block font-bold group">
              {setting.label}
              {setting.defaultValue && (
                <button
                  onClick={(): void =>
                    setValue(setting.key, setting.defaultValue)
                  }
                  className="hidden cursor-pointer text-warm-gray-400 group-hover:inline-block"
                  data-bs-toggle="tooltip"
                  data-bs-placement="right"
                  title="Restore default value"
                  type="button"
                >
                  <FontAwesomeIcon
                    icon={faArrowRightArrowLeft}
                    size="1x"
                    className="ml-2 hover:text-warm-gray-500 dark:hover:text-warm-gray-300"
                  />
                </button>
              )}
            </label>
            {(setting.type === 'String' ||
              setting.type === 'IntegerList' ||
              setting.type === 'StringList') && (
              <>
                <SettingDescription />
                <StringInput
                  name={setting.key}
                  apiResponse={apiResponse}
                  disabled={disabled}
                />
              </>
            )}
            {(setting.type === 'Float' || setting.type === 'Integer') && (
              <>
                <SettingDescription />
                <NumberInput
                  name={setting.key}
                  apiResponse={apiResponse}
                  disabled={disabled}
                />
              </>
            )}
            {(setting.type === 'Textarea' || setting.type === 'JSON') && (
              <>
                <SettingDescription />
                <TextareaInput
                  name={setting.key}
                  apiResponse={apiResponse}
                  disabled={disabled}
                />
              </>
            )}
            {setting.type === 'Boolean' && (
              <div className="flex items-center">
                <div className="grow">
                  <SettingDescription />
                </div>
                <div className="flex-none">
                  <BooleanInput
                    name={setting.key}
                    apiResponse={apiResponse}
                    disabled={disabled}
                  />
                </div>
              </div>
            )}
            {setting.type === 'Image' && (
              <>
                <SettingDescription />
                <ImageFileInput
                  name={setting.key}
                  src={setting.valueRealized as string}
                  disabled={disabled}
                />
              </>
            )}
            {setting.type === 'Radio' && (
              <>
                <SettingDescription />
                <RadioInput
                  name={setting.key}
                  apiResponse={apiResponse}
                  dbValue={setting.valueRealized as string}
                  values={JSON.parse(setting.options)}
                  disabled={disabled}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const SettingsForm = ({
  settings,
  parentOnSubmit: onSubmitParent,
  disabled = false,
}: SettingsFormProps): JSX.Element | null => {
  const [apiResponse, setApiResponse] = useState<
    AxiosResponse<unknown> | AxiosError | undefined
  >(undefined);
  if (!Array.isArray(settings) || settings.length === 0) return null;

  // Is only called if validate is successful
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: Record<string, any>): Promise<void> => {
    for (const setting of settings) {
      const value =
        typeof values[setting.key] === 'boolean'
          ? values[setting.key].toString()
          : values[setting.key];
      if (value !== setting.value) {
        const updatedSetting = { ...setting, value: value || '' };
        const apiResponse = await onSubmitParent(updatedSetting);
        setApiResponse(apiResponse);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialValues = {} as any;
  for (const setting of settings) {
    if (setting.type === 'Boolean') {
      initialValues[setting.key] = setting.valueRealized;
    } else {
      initialValues[setting.key] = setting.value || '';
    }
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
        setValue: ([field, value], state, { changeValue }): void => {
          changeValue(state, field, () => value);
        },
      }}
      render={({
        handleSubmit,
        form: {
          mutators: { setValue },
        },
      }): JSX.Element => {
        return (
          <>
            {disabled && (
              <Notice type="info" className="mb-8">
                <span>
                  The settings cannot be changed once a period is in
                  quantification.
                </span>
              </Notice>
            )}
            <form onSubmit={handleSubmit} className="leading-loose">
              {FormFields(settings, apiResponse, setValue, disabled)}
              <div className="mt-4">
                <SubmitButton />
              </div>
            </form>
          </>
        );
      }}
    />
  );
};
