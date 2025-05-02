import { differenceInDays, format, formatDistanceToNow, isValid } from "date-fns";

export function formatSmartDate(dateString: string): string {
    const date = new Date(dateString);

    if (!isValid(date)) {
        return "Invalid: " + dateString;
    }

    const daysAgo = differenceInDays(new Date(), date);

    if (daysAgo <= 7) {
        return formatDistanceToNow(date, { addSuffix: true });
    }

    return format(date, "MMM d, yyyy");
}