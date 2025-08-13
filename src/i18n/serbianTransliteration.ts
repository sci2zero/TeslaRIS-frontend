// serbianTransliteration.ts
const cyrillic = [
    'Љ', 'Љ', 'Њ', 'Њ', 'Џ', 'Џ',
    'А', 'Б', 'В', 'Г', 'Д', 'Ђ', 'Е', 'Ж', 'З', 'И', 'Ј', 'К', 'Л', 'М',
    'Н', 'О', 'П', 'Р', 'С', 'Т', 'Ћ', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш',
    'љ', 'њ', 'џ',
    'а', 'б', 'в', 'г', 'д', 'ђ', 'е', 'ж', 'з', 'и', 'ј', 'к', 'л', 'м',
    'н', 'о', 'п', 'р', 'с', 'т', 'ћ', 'у', 'ф', 'х', 'ц', 'ч', 'ш'
];

const latin = [
    'Lj', 'LJ', 'Nj', 'NJ', 'Dž', 'DŽ',
    'A', 'B', 'V', 'G', 'D', 'Đ', 'E', 'Ž', 'Z', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'R', 'S', 'T', 'Ć', 'U', 'F', 'H', 'C', 'Č', 'Š',
    'lj', 'nj', 'dž',
    'a', 'b', 'v', 'g', 'd', 'đ', 'e', 'ž', 'z', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'r', 's', 't', 'ć', 'u', 'f', 'h', 'c', 'č', 'š'
];

function convert(text: string, from: string[], to: string[]): string {
    let result = text;

    for (let i = 0; i < from.length; i++) {
        const regex = new RegExp(from[i], 'g');
        result = result.replace(regex, to[i]);
    }

    return result;
}

export function toLatin(text: string): string {
    return convert(text, cyrillic, latin);
}

export function toCyrillic(text: string): string {
    return convert(text, latin, cyrillic);
}
