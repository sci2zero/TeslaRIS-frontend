import { ApiKeyType } from "@/models/Common";
import i18n from ".";

export const apiKeyTypeSr = [
    { title: "M Servis", value: ApiKeyType.M_SERVICE }
];

export const apiKeyTypeEn = [
    { title: "M Service", value: ApiKeyType.M_SERVICE }
];

export const getApiKeyTypeTitleFromValueAutoLocale = (value: ApiKeyType) => {
    const locale = i18n.vueI18n.global.locale;

    let apiKeyTypeArray = apiKeyTypeEn;
    if (locale == "sr") {
        apiKeyTypeArray = apiKeyTypeSr;
    }

    return (apiKeyTypeArray.find(item => item.value === value) || {}).title;
};

export const getApiKeyTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return apiKeyTypeSr;
        case "en":
            return apiKeyTypeEn;
    }
};
