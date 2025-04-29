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
