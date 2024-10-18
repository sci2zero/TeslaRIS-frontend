export const localiseDate = (iso8601DateString: string | undefined) => {
    if(!iso8601DateString) {
        return "";
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
}