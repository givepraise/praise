import { format } from "date-fns";

export const DEFAULT_DATE_FORMAT = "yyyy-MM-dd";

export const formatDate = (isoDate: string) => {
  if (isoDate === '-') {
    return "-"
  } else {
    return format(new Date(isoDate), DEFAULT_DATE_FORMAT);
  }
};
