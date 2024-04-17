import { OrganisationUnitsRelationType } from "@/models/OrganisationUnitModel";

export const relationTypeSr = [
    { title: "Belongs To", value: OrganisationUnitsRelationType.BELONGS_TO },
    { title: "Member Of", value: OrganisationUnitsRelationType.MEMBER_OF }
];

export const relationTypeEn = [
    { title: "Pripada", value: OrganisationUnitsRelationType.BELONGS_TO },
    { title: "Član", value: OrganisationUnitsRelationType.MEMBER_OF }
];

export const getTitleFromValueAutoLocale = (value: OrganisationUnitsRelationType, locale: string) => {
    let relationTypeArray = relationTypeEn;
    if (locale == "sr") {
        relationTypeArray = relationTypeSr;
    }

    return (relationTypeArray.find(item => item.value === value) || {}).title;
};

export const getTypesForGivenLocale = (locale: string) => {
    switch(locale) {
        case "sr":
            return relationTypeSr;
        case "en":
            return relationTypeEn;
    }
};
