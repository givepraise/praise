import { format, isValid } from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_FORMAT_LONG = 'yyyy-MM-dd HH:mm';

export const formatDate = (isoDate: string): string => {
  return format(new Date(isoDate), DATE_FORMAT);
};

export const formatDateLong = (isoDate: string): string => {
  return format(new Date(isoDate), DATE_FORMAT_LONG);
};

export const isValidDate = (inputString: string): boolean => {
  return isValid(new Date(inputString));
};
