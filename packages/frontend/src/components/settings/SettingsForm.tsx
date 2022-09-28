/* eslint-disable @typescript-eslint/no-misused-promises */
import { Form } from 'react-final-form';
import { PeriodSettingDto } from 'api/src/periodsettings/types';
import { SettingDto } from 'api/dist/settings/types';
import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { NumberInput } from '@/components/form/NumberInput';
import { StringInput } from '@/components/form/StringInput';
import { TextareaInput } from '@/components/form/TextareaInput';
import { BooleanInput } from '@/components/form/BooleanInput';
import { ImageFileInput } from '@/components/form/ImageFileInput';
import { Notice } from '@/components/ui/Notice';
import { SubmitButton } from '../form/SubmitButton';
import { RadioInput } from '../form/RadioInput';

interface SettingsFormProps {
  settings: SettingDto[] | PeriodSettingDto[] | undefined;
  parentOnSubmit(
    setting: SettingDto | PeriodSettingDto
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
  disabled?: boolean
): JSX.Element => {
  return (
    <div className="mb-2 space-y-4">
      {settings.map((setting) => {
        return (
          <div key={setting.key}>
            <label className="block font-bold">{setting.label}</label>
            {setting.description && (
              <div className="mb-2 text-sm text-warm-gray-400">
                {setting.description}
              </div>
            )}
            {(setting.type === 'String' ||
              setting.type === 'IntegerList' ||
              setting.type === 'StringList') && (
              <StringInput
                name={setting.key}
                apiResponse={apiResponse}
                disabled={disabled}
              />
            )}
            {(setting.type === 'Float' || setting.type === 'Integer') && (
              <NumberInput
                name={setting.key}
                apiResponse={apiResponse}
                disabled={disabled}
              />
            )}
            {(setting.type === 'Textarea' || setting.type === 'JSON') && (
              <TextareaInput
                name={setting.key}
                apiResponse={apiResponse}
                disabled={disabled}
              />
            )}
            {setting.type === 'Boolean' && (
              <BooleanInput
                name={setting.key}
                apiResponse={apiResponse}
                disabled={disabled}
              />
            )}
            {setting.type === 'Image' && (
              <ImageFileInput
                name={setting.key}
                src={setting.valueRealized as string}
                disabled={disabled}
              />
            )}
            {setting.type === 'Radio' && (
              <RadioInput
                name={setting.key}
                apiResponse={apiResponse}
                dbValue={setting.valueRealized as string}
                values={JSON.parse(setting.options)}
                disabled={disabled}
              />
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
      const value = values[setting.key];
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
      render={({ handleSubmit }): JSX.Element => {
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
              {FormFields(settings, apiResponse, disabled)}
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
