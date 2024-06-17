export const localiseDate = (iso8601DateString: string | undefined) => {
    if(!iso8601DateString) {
        return "";
    }

    const dateParts = iso8601DateString.split('-');

    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];

    // Serbian standard
    return `${day}.${month}.${year}.`;
}