import { parse, parseISO, formatRelative, formatDistance } from 'date-fns';
import { enGB } from 'date-fns/esm/locale';
import { utcToZonedTime, format } from 'date-fns-tz';
import jstz from 'jstz';

export const DATE_FORMAT = 'yyyy-MM-dd';
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
    lastWeek: 'eeee',
    yesterday: "'yesterday'",
    today: ' ',
    tomorrow: "'tomorrow' p",
    nextWeek: 'eeee p',
    other: DATE_FORMAT,
  };

  const locale = {
    ...enGB,
    formatRelative: (token) => formatRelativeLocale[token],
  };

  const dateUtc = parseISO(dateIso);
  const dateLocal = utcDateToLocal(dateUtc);

  const formatDisanceValue = formatDistance(new Date(dateLocal), new Date(), {
    addSuffix: true,
  });

  const dateSuffix =
    parseInt(formatDisanceValue) > 6
      ? ''
      : Number.isNaN(parseInt(formatDisanceValue))
      ? formatDisanceValue
      : ', ' + formatDisanceValue;

  return formatRelative(dateLocal, new Date(), { locale }) + dateSuffix;
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
  pattern: string = DATE_FORMAT_LONG
): string => {
  const date = parseISO(dateIso);
  const dateUtc = utcToZonedTime(date, 'UTC');
  const formattedDateUtc = format(dateUtc, pattern, {
    timeZone: 'UTC',
  });

  return formattedDateUtc;
};
