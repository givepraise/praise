import { format, isValid, parse } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import jstz from 'jstz';

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_FORMAT_LONG = 'yyyy-MM-dd HH:mm';

export const formatDate = (
  isoDate: string,
  pattern: string = DATE_FORMAT
): string => {
  return format(new Date(isoDate), pattern);
};

export const formatDateLong = (isoDate: string): string => {
  return formatDate(isoDate, DATE_FORMAT_LONG);
};

  return format(new Date(isoDate), DATE_FORMAT_LONG);
};

export const isValidDate = (inputString: string): boolean => {
  return isValid(new Date(inputString));
};

export const localDateToUtc = (dateLocal: Date): Date => {
  const timezone = jstz.determine().name();
  const dateUtc = zonedTimeToUtc(dateLocal, timezone);

  return dateUtc;
};

export const utcDateToLocal = (dateUtc: Date): Date => {
  const timezone = jstz.determine().name();
  const dateLocal = utcToZonedTime(dateUtc, timezone);

  return dateLocal;
};
