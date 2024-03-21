export function getNameFromOrdinal(enumObj: any, ordinal: number): string | undefined {
    for (const key in enumObj) {
        if (typeof enumObj[key] === 'number' && enumObj[key] === ordinal) {
            return key;
        }
    }
    return undefined;
}
