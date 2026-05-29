import { format, parseISO, isValid } from "date-fns";

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return "-";
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, "dd/MM/yyyy") : "-";
};
