import { OrganisationUnitsRelationType } from "@/models/OrganisationUnitModel";
import i18n from ".";

export const relationTypeEn = [
    { title: "Belongs To", value: OrganisationUnitsRelationType.BELONGS_TO },
    { title: "Member Of", value: OrganisationUnitsRelationType.MEMBER_OF }
];

export const relationTypeSr = [
    { title: "Pripada", value: OrganisationUnitsRelationType.BELONGS_TO },
    { title: "Član", value: OrganisationUnitsRelationType.MEMBER_OF }
];

export const getTitleFromValueAutoLocale = (value: OrganisationUnitsRelationType) => {
    const locale = i18n.vueI18n.global.locale;

    let relationTypeArray = relationTypeEn;
    if (locale == "sr") {
        relationTypeArray = relationTypeSr;
    }

    return (relationTypeArray.find(item => item.value === value) || {}).title;
};

export const getTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return relationTypeSr;
        case "en":
            return relationTypeEn;
    }
};
