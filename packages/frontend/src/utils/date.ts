import { parse, parseISO, formatRelative } from 'date-fns';
import { enUS } from 'date-fns/esm/locale';
import { utcToZonedTime, format } from 'date-fns-tz';
import jstz from 'jstz';

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_FORMAT_TZ = 'yyyy-MM-dd z';
export const DATE_FORMAT_NAME = 'MMMM dd yyyy';
export const DATE_FORMAT_LONG = 'yyyy-MM-dd HH:mm:ss';
export const DATE_FORMAT_LONG_NAME = 'EEEE, MMMM dd yyyy, HH:mm';

export const parseDate = (
  date: string,
  pattern: string = DATE_FORMAT
): Date => {
  return parse(date, pattern, new Date());
};

const utcDateToLocal = (dateUtc: Date): Date => {
  const timezone = jstz.determine().name();
  const dateLocal = utcToZonedTime(dateUtc, timezone);

  return dateLocal;
};

export const localizeAndFormatIsoDateRelative = (dateIso: string): string => {
  const formatRelativeLocale = {
    lastWeek: "'last' eeee p",
    yesterday: "'yesterday' p",
    today: "'today' p",
    tomorrow: "'tomorrow' p",
    nextWeek: 'eeee p',
    other: DATE_FORMAT,
  };

  const locale = {
    ...enUS,
    formatRelative: (token) => formatRelativeLocale[token],
  };

  const dateUtc = parseISO(dateIso);
  const dateLocal = utcDateToLocal(dateUtc);

  return formatRelative(dateLocal, new Date(), { locale });
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
