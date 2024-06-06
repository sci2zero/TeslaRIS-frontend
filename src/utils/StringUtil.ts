export const removeTrailingPipeRegex = (text: string): string => {
    return text.replace(/ \| $/, '');
}

export const displayTextOrPlaceholder = (text: string): string => {
    return (text && text.length > 0) ? text : "-";
}