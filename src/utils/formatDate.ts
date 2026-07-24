import { format, isValid } from "date-fns";

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return "-";
  const normalized = date.length === 10 ? date + "T00:00:00" : date;
  const parsed = new Date(normalized);
  return isValid(parsed) ? format(parsed, "dd/MM/yyyy") : "-";
};
