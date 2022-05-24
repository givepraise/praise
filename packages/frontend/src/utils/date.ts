import { parse, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
import jstz from 'jstz';

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_FORMAT_TZ = 'yyyy-MM-dd z';
export const DATE_FORMAT_LONG = 'yyyy-MM-dd HH:mm:ss';
export const DATE_FORMAT_LONG_NAME = 'dd MMM yyyy, HH:mm';

export const parseDate = (
  date: string,
  pattern: string = DATE_FORMAT
): Date => {
  return parse(date, pattern, new Date());
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

const getLeadingZero = (number: number): string => {
  return String(number).padStart(2, '0');
};

export const getTimeDifferenceFromNow = (
  date: string,
  pattern: string = DATE_FORMAT
): string => {
  const dateUtc = parseISO(date);
  const dateLocal = utcDateToLocal(dateUtc);

  const newDate = new Date(dateLocal);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (newDate.getDate() === today.getDate()) {
    return `today ${getLeadingZero(newDate.getHours())}:${getLeadingZero(
      newDate.getMinutes()
    )}`;
  } else if (newDate.getDate() === yesterday.getDate()) {
    return `yesterday ${getLeadingZero(newDate.getHours())}:${getLeadingZero(
      newDate.getMinutes()
    )}`;
  } else {
    return format(dateLocal, pattern);
  }
};

export const localizeAndFormatIsoDate = (
  dateIso: string,
  pattern: string = DATE_FORMAT
): string => {
  const dateUtc = parseISO(dateIso);
  const dateLocal = utcDateToLocal(dateUtc);

  return format(dateLocal, pattern);
};

export const formatIsoDateUTC = (
  dateIso: string,
  pattern: string = DATE_FORMAT_TZ
): string => {
  const date = parseISO(dateIso);
  const dateUtc = utcToZonedTime(date, 'UTC');
  const formattedDateUtc = format(dateUtc, pattern, {
    timeZone: 'UTC',
  });

  return formattedDateUtc;
};
