import { type FlexibleDate } from "@/models/Common";
import { RecurrenceType } from "@/models/LoadModel";
import { DateTime } from "luxon";

export const localiseRelativeTimestamp = (
    timestamp: string,
    translate: (key: string, values: Record<string, string>) => string,
    now = DateTime.local()
): string => {
    const dateTime = DateTime.fromISO(timestamp, { setZone: true }).toLocal();
    if (!dateTime.isValid) return timestamp;

    const day = dateTime.toISODate();
    const time = dateTime.toFormat('HH:mm');
    if (day === now.toISODate()) return translate('timestampTodayAt', { time });
    if (day === now.minus({ days: 1 }).toISODate()) return translate('timestampYesterdayAt', { time });
    if (day === now.plus({ days: 1 }).toISODate()) return translate('timestampTomorrowAt', { time });
    return localiseDate(day ?? undefined);
};


export const localiseDate = (iso8601DateString: string | undefined) => {
    if(!iso8601DateString) {
        return "";
    }

    if (iso8601DateString.includes("T")) {
        iso8601DateString = iso8601DateString.split("T")[0];
    }

    if(!iso8601DateString.includes("-")) {
        return iso8601DateString;
    }

    const dateParts = iso8601DateString.split('-');

    const year = dateParts[0];
    const month = dateParts[1];

    if (dateParts.length == 2) {
        return `${month}.${year}.`;
    }
    
    const day = dateParts[2];

    if (!month || !day) {
        return iso8601DateString;
    }

    // Serbian standard
    return `${day}.${month}.${year}.`;
};

export const localiseFlexibleDate = (date: FlexibleDate | undefined) => {
    if (!date) {
        return "";
    }

    const { year, month, day } = date;

    if (!year) {
        return "";
    }

    if (!month) {
        return `${year}.`;
    }

    if (!day) {
        return `${month}.${year}.`;
    }

    return `${day}.${month}.${year}.`;
};

export const localiseDateRange = (from: string, to: string): string => {
    if(!from || !to) {
        return "";
    }

    const fromDate = new Date(Date.parse(from));
    const toDate = new Date(Date.parse(to));
    if (fromDate.getDate() === 1 && fromDate.getMonth() === 0 && 
        fromDate.getDate() === toDate.getDate() && 
        fromDate.getMonth() === toDate.getMonth() && 
        fromDate.getFullYear() === toDate.getFullYear()) 
    {
        return `${fromDate.getFullYear()}`;
    }

    const diffInMonths = Math.abs((toDate.getMonth() - fromDate.getMonth()) + 
              12 * (toDate.getFullYear() - fromDate.getFullYear()));

    if (diffInMonths > 3) {
        return fromDate.getFullYear().toString();
    }

    return `${fromDate.toLocaleDateString("sr")} - ${toDate.toLocaleDateString("sr")}`;
};

export const localiseTime = (timeString: string | undefined) => {
    if(!timeString) {
        return "";
    }

    if (timeString.includes(":")) {
        const tokens = timeString.split(":");
        return `${tokens[0]}:${tokens[1]}h`
    }

    return timeString;
};

export const computeNextDates = (day: number, month: number, year: number, recurrence: RecurrenceType): Date[] => {
    const results: Date[] = [];
    const occurrenceDate = new Date();

    for (let i = 0; i < 3; i++) {
        const newDate = new Date(occurrenceDate);

        if (year === 0) {
            newDate.setFullYear(occurrenceDate.getFullYear());
        } else if (year > 0) {
            newDate.setFullYear(year);
        } else {
            newDate.setFullYear(occurrenceDate.getFullYear() + year);
        }

        if (month === 0) {
            newDate.setMonth(occurrenceDate.getMonth());
        } else if (month > 0) {
            newDate.setMonth(month - 1); // JS months are 0-based
        } else {
            newDate.setMonth(occurrenceDate.getMonth() + month);
        }

        if (day === 0) {
            newDate.setDate(occurrenceDate.getDate());
        } else if (day > 0) {
            newDate.setDate(day);
        } else {
            newDate.setDate(occurrenceDate.getDate() + day);
        }

        results.push(newDate);

        switch (recurrence) {
            case RecurrenceType.DAILY:
                occurrenceDate.setDate(occurrenceDate.getDate() + 1);
                break;
            case RecurrenceType.WEEKLY:
                occurrenceDate.setDate(occurrenceDate.getDate() + 7);
                break;
            case RecurrenceType.MONTHLY:
                occurrenceDate.setMonth(occurrenceDate.getMonth() + 1);
                break;
            case RecurrenceType.THREE_MONTHLY:
                occurrenceDate.setMonth(occurrenceDate.getMonth() + 3);
                break;
            case RecurrenceType.YEARLY:
                occurrenceDate.setFullYear(occurrenceDate.getFullYear() + 1);
                break;
        }
    }

    return results;
};

export const computeNextYears = (year: number, recurrence: RecurrenceType): number[] => {
    const years: number[] = [];
    year = year * 1;

    for (let i = 0; i < 3; i++) {
        const newDate = new Date();
        
        if (year > 0) {
            newDate.setFullYear(year);
        } else if (year < 0) {
            newDate.setFullYear(newDate.getFullYear() + year);
        }
        
        switch (recurrence) {
            case RecurrenceType.DAILY:
                newDate.setDate(newDate.getDate() + i);
                break;
            case RecurrenceType.WEEKLY:
                newDate.setDate(newDate.getDate() + (i * 7));
                break;
            case RecurrenceType.MONTHLY:
                newDate.setMonth(newDate.getMonth() + i);
                break;
            case RecurrenceType.THREE_MONTHLY:
                newDate.setMonth(newDate.getMonth() + (i * 3));
                break;
            case RecurrenceType.YEARLY:
                newDate.setFullYear(newDate.getFullYear() + i);
                break;
        }

        years.push(newDate.getFullYear());
    }

    return years;
};

export const computeRelativeDate = (dateString: string): string => {
    const dateParts = dateString.split("%7C");

    const year = parseInt(dateParts[0]) || 0;
    const month = parseInt(dateParts[1]) || 0;
    const day = parseInt(dateParts[2]) || 0;

    const date = new Date();

    if (day > 0) {
        date.setDate(day);
    } else if (day < 0) {
        date.setDate(date.getDate() + day);
    }

    if (month > 0) {
        date.setMonth(month - 1);
    } else if (month < 0) {
        date.setMonth(date.getMonth() + month);
    }

    if (year > 0) {
        date.setFullYear(year);
    } else if (year < 0) {
        date.setFullYear(date.getFullYear() + year);
    }

    return date.toISOString();
};

export const toUtcTimestamp = (localTimestamp: string): string => {

    const localDateTime = DateTime.fromISO(localTimestamp, { setZone: true });
    if (!localDateTime.isValid) {
        throw new Error(`Invalid datetime string: ${localTimestamp}`);
    }

    return localDateTime.toUTC().toISO({ suppressMilliseconds: true })!;
};

/** Convert an API timestamp carrying Z or an offset into browser-local display time. */
export const serverTimeToLocal = (serverTimeString: string): string => {
    const dateTime = DateTime.fromISO(serverTimeString, { setZone: true });
    if (!dateTime.isValid) {
        throw new Error(`Invalid server datetime: ${serverTimeString}`);
    }
    return dateTime.toLocal().toFormat("yyyy-MM-dd'T'HH:mm:ss");
};

export const serverTimeToLocalTime = (serverTimeString: string): string => {
    return DateTime.fromISO(serverTimeToLocal(serverTimeString)).toFormat("HH:mm") + "h";
};
