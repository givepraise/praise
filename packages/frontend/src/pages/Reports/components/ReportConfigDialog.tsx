import {
  faCogs,
  faFileDownload,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { useRecoilValue } from 'recoil';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SingleSetting } from '@/model/settings/settings';
import { ReportManifestDto } from '../../../model/report/dto/report-manifest.dto';
import { ReportConfigFormFields } from './ReportConfigFormFields';
import { ConfigurationValueDto } from '../../../model/report/dto/configuration-value.dto';
import { Form } from 'react-final-form';
import toast from 'react-hot-toast';

function configToInitialValues(
  config?: Record<string, ConfigurationValueDto | undefined>
) {
  if (!config) return {};
  const initialValues = {};
  Object.keys(config).forEach((key) => {
    let value = config[key]?.default;
    if (Array.isArray(value)) {
      value = value.join(', ');
    }
    initialValues[key] = value;
  });
  return initialValues;
}

// Function to parse input string to string[]
function parseToStringArray(input: string): string[] {
  const regex = /"([^"]+)"|([^,]+)/g;
  let match;
  const result: string[] = [];

  while ((match = regex.exec(input)) !== null) {
    if (match[1]) {
      // Matched a string enclosed in quotes
      result.push(match[1]);
    } else if (match[2]) {
      // Matched a string without quotes
      result.push(match[2].trim());
    }
  }

  return result;
}

// Function to parse input string to number[]
function parseToNumberArray(input: string): number[] {
  const regex = /(\d+(\.\d+)?)/g; // Regex pattern to match only numbers (with optional decimals)
  let match;
  const result: number[] = [];

  while ((match = regex.exec(input)) !== null) {
    const potentialNumber = parseFloat(match[1]);
    if (!isNaN(potentialNumber)) {
      result.push(potentialNumber);
    }
  }

  return result;
}

type FormValue = string | number | boolean | string[] | number[] | undefined;
type FormValues = Record<string, FormValue>;

type ReportConfigDialogProps = {
  manifest?: ReportManifestDto;
  onClose(): void;
  onRun(config: Record<string, string>): void;
};

export const ReportConfigDialog = ({
  manifest,
  onClose,
  onRun,
}: ReportConfigDialogProps) => {
  // How much of the distribution should go to the development team
  const csSupportPercentage = useRecoilValue(
    SingleSetting('CS_SUPPORT_PERCENTAGE')
  );

  const onSubmit = (values: FormValues) => {
    const config = {};

    // Make sure that the values are in the correct format for the report engine
    Object.keys(values).forEach((key) => {
      const value = values[key];
      const c = manifest?.configuration[key];
      if (!c) return;

      if (c.type === 'string' || c.type === 'number' || c.type === 'boolean') {
        config[key] = value;
      }

      if (
        c.type === 'array' &&
        c.items?.type === 'string' &&
        typeof value === 'string'
      ) {
        const arr = parseToStringArray(value);
        config[key] = arr;
      }

      if (
        c.type === 'array' &&
        c.items?.type === 'number' &&
        typeof value === 'string'
      ) {
        const arr = parseToNumberArray(value);
        config[key] = arr;
      }
    });

    try {
      onRun(config);
      onClose();
    } catch (error) {
      toast.error((error as Error).message);
      return;
    }
  };

  if (!csSupportPercentage) return null;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white w-[600px] rounded dark:bg-slate-600 dark:text-white ">
        <div className="flex justify-end p-6">
          <Button variant="round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </Button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faCogs} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">
            {manifest?.displayName}
          </Dialog.Title>
          {manifest?.description && (
            <div className="mb-3">{manifest.description}</div>
          )}
          <Form
            onSubmit={onSubmit}
            initialValues={configToInitialValues(manifest?.configuration)}
            render={({ handleSubmit, submitting }) => (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (handleSubmit) {
                    void handleSubmit();
                  }
                }}
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-5 p-5 overflow-auto border rounded-lg max-h-[500px] max-w-2xl dark:border-slate-400 bg-warm-gray-50 dark:bg-slate-600">
                    <ReportConfigFormFields manifest={manifest} />
                  </div>
                  {manifest?.categories.find((c) => c === 'rewards') && (
                    <>
                      {csSupportPercentage?.valueRealized &&
                      (csSupportPercentage.valueRealized as number) > 0 ? (
                        <p>
                          Thank you for supporting the continued development of
                          Praise! <b>{csSupportPercentage?.valueRealized}%</b>{' '}
                          will be added to the token distribution.{' '}
                          <Link to={'/settings/rewards'}>Change settings</Link>
                        </p>
                      ) : (
                        <p>
                          Support the development of Praise, consider donating a
                          percentage of the distribution to the development
                          team.{' '}
                          <Link to={'/settings/rewards'}>Change settings</Link>
                        </p>
                      )}
                    </>
                  )}
                  <div className="flex justify-center">
                    <Button type="submit" disabled={submitting}>
                      <FontAwesomeIcon
                        className="mr-2"
                        icon={faFileDownload}
                        size="1x"
                      />
                      Run report
                    </Button>
                  </div>
                </div>
              </form>
            )}
          />
        </div>
      </div>
    </div>
  );
};
