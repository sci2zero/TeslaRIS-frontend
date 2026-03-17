import { OrganisationUnitSector } from "@/models/OrganisationUnitModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


const oUSectorEn = [
    { title: "Academic", value: OrganisationUnitSector.ACADEMIC },
    { title: "Company", value: OrganisationUnitSector.COMPANY },
    { title: "Health", value: OrganisationUnitSector.HEALTH },
    { title: "Institution", value: OrganisationUnitSector.INSTITUTION },
    { title: "Government", value: OrganisationUnitSector.GOVERNMENT },
    { title: "Other", value: OrganisationUnitSector.OTHER }
];

const oUSectorSr = [
    { title: "Akademski", value: OrganisationUnitSector.ACADEMIC },
    { title: "Kompanijski", value: OrganisationUnitSector.COMPANY },
    { title: "Zdravstveni", value: OrganisationUnitSector.HEALTH },
    { title: "Institucionalni", value: OrganisationUnitSector.INSTITUTION },
    { title: "Državni", value: OrganisationUnitSector.GOVERNMENT },
    { title: "Ostalo", value: OrganisationUnitSector.OTHER }
];

export const getOUSectorFromValueAutoLocale = (value: OrganisationUnitSector) => {
    const locale = i18n.vueI18n.global.locale;
    
    let oUSectorArray = oUSectorEn;
    if (locale == "sr") {
        oUSectorArray = oUSectorSr;
    } else if (locale == "sr-cyr") {
        oUSectorArray = transliterateContentToCyrillic(oUSectorSr);
    }

    return (oUSectorArray.find(item => item.value === value) || {}).title;
};

export const getOUSectorsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return oUSectorSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(oUSectorSr);
        case "en":
            return oUSectorEn;
    }
};
