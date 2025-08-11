import { RecurrenceType } from "@/models/LoadModel";

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
    const day = dateParts[2];

    if (!month || !day) {
        return iso8601DateString;
    }

    // Serbian standard
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
    const baseDate = new Date();

    for (let i = 0; i < 3; i++) {
        const newDate = new Date(baseDate);

        if (day > 0) {
            newDate.setDate(day);
        } else if (day < 0) {
            newDate.setDate(newDate.getDate() + day);
        }

        if (month > 0) {
            newDate.setMonth(month - 1);
        } else if (month < 0) {
            newDate.setMonth(newDate.getMonth() + month);
        }

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
                newDate.setDate(newDate.getDate() + i * 7);
                break;
            case RecurrenceType.MONTHLY:
                newDate.setMonth(newDate.getMonth() + i);
                break;
            case RecurrenceType.THREE_MONTHLY:
                newDate.setMonth(newDate.getMonth() + i * 3);
                break;
            case RecurrenceType.YEARLY:
                newDate.setFullYear(newDate.getFullYear() + i);
                break;
        }

        results.push(newDate);
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
