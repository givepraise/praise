import { format, isValid } from "date-fns";

export const DEFAULT_DATE_FORMAT = "yyyy-MM-dd";

export const formatDate = (isoDate: string) => {
    return format(new Date(isoDate), DEFAULT_DATE_FORMAT);
};

export const isValidDate = (inputString: string): boolean => {
    return isValid(new Date(inputString));
};
