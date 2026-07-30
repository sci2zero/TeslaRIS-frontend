export const formatAmount = (value: number | undefined | null, locale: string): string => {
    if (value === undefined || value === null) return '';

    let normalizedLocale = locale;
    if (locale.toLowerCase().includes('cyr') || locale.toLowerCase().startsWith('sr-')) {
        normalizedLocale = 'sr-RS';
    }

    return new Intl.NumberFormat(normalizedLocale, { maximumFractionDigits: 3 }).format(value);
};
