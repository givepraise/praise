import { ConfigurationValueDto } from '../../../model/report/dto/configuration-value.dto';
import { ReportManifestDto } from '../../../model/report/dto/report-manifest.dto';
import { Field } from 'react-final-form';

function typeToInputType(type?: string) {
  switch (type) {
    case 'number':
      return 'number';
    case 'string':
      return 'text';
    case 'boolean':
      return 'checkbox';
    default:
      return 'text';
  }
}

function inputStyle(config?: ConfigurationValueDto) {
  if (!config || typeof config.default !== 'boolean') {
    return 'block w-full';
  }
}

type ReportConfigFormFieldsProps = {
  manifest?: ReportManifestDto;
};

export function ReportConfigFormFields({
  manifest,
}: ReportConfigFormFieldsProps) {
  if (!manifest) {
    return null;
  }

  return (
    <>
      {manifest?.configuration &&
        Object.entries(manifest.configuration).map(([key, conf]) => {
          return (
            <Field
              name={key}
              component="input"
              key={key}
              type={typeToInputType(conf?.type)}
            >
              {({ input, meta }) => (
                <div className="flex flex-col">
                  <div
                    className={
                      conf?.type === 'boolean'
                        ? 'flex items-center gap-2'
                        : 'flex flex-col gap-2'
                    }
                  >
                    <div className="flex flex-col gap-2">
                      <label className="block font-bold">{key}</label>
                      <div className="text-sm text-warm-gray-400">
                        {conf?.description}
                      </div>
                    </div>
                    <input {...input} className={inputStyle(conf)} />
                  </div>
                  {meta.touched && meta.error && (
                    <span className="mt-1 text-sm text-red-600">
                      {meta.error}
                    </span>
                  )}
                </div>
              )}
            </Field>
          );
        })}
    </>
  );
}
