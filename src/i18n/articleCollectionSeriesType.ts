import { ArticleCollectionSeriesType } from "@/models/JournalModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const articleCollectionSeriesTypeEn = [
    { title: "Journal", value: ArticleCollectionSeriesType.JOURNAL },
    { title: "Magazine", value: ArticleCollectionSeriesType.MAGAZINE },
    { title: "Newspaper", value: ArticleCollectionSeriesType.NEWSPAPER },
    { title: "Newsletter", value: ArticleCollectionSeriesType.NEWSLETTER }
];

export const articleCollectionSeriesTypeSr = [
    { title: "Naučni časopis", value: ArticleCollectionSeriesType.JOURNAL },
    { title: "Časopis", value: ArticleCollectionSeriesType.MAGAZINE },
    { title: "Novine", value: ArticleCollectionSeriesType.NEWSPAPER },
    { title: "Bilten", value: ArticleCollectionSeriesType.NEWSLETTER }
];

export const getArticleCollectionSeriesTypeTitleFromValue = (
    value: ArticleCollectionSeriesType, articleCollectionSeriesTypeArray: {title: string, value: ArticleCollectionSeriesType}[]
) => {
    return (articleCollectionSeriesTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getArticleCollectionSeriesTypeTitleFromValueAutoLocale = (
    value: ArticleCollectionSeriesType | string
) => {
    const locale = i18n.vueI18n.global.locale;

    let articleCollectionSeriesTypeArray = articleCollectionSeriesTypeEn;
    if (locale == "sr") {
        articleCollectionSeriesTypeArray = articleCollectionSeriesTypeSr;
    } else if (locale == "sr-cyr") {
        articleCollectionSeriesTypeArray = transliterateContentToCyrillic(articleCollectionSeriesTypeSr);
    }

    return (articleCollectionSeriesTypeArray.find(item => item.value === value) || {}).title;
};

export const getArticleCollectionSeriesTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return articleCollectionSeriesTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(articleCollectionSeriesTypeSr);
        case "en":
            return articleCollectionSeriesTypeEn;
    }
};
