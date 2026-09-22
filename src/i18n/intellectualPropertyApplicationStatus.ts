import { IntellectualPropertyApplicationStatus, IntellectualPropertyType } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const intellectualPropertyApplicationStatusEn = [
    { title: "Disclosed", value: IntellectualPropertyApplicationStatus.DISCLOSED },
    { title: "Pending", value: IntellectualPropertyApplicationStatus.PENDING },
    { title: "In negotiation", value: IntellectualPropertyApplicationStatus.IN_NEGOTIATION },
    { title: "Allowed", value: IntellectualPropertyApplicationStatus.ALLOWED },
    { title: "Granted / Registered", value: IntellectualPropertyApplicationStatus.GRANTED_OR_REGISTERED },
    { title: "Protected", value: IntellectualPropertyApplicationStatus.PROTECTED },
    { title: "Assigned", value: IntellectualPropertyApplicationStatus.ASSIGNED },
    { title: "First fixation", value: IntellectualPropertyApplicationStatus.FIRST_FIXATION },
    { title: "Expired", value: IntellectualPropertyApplicationStatus.EXPIRED },
    { title: "Withdrawn", value: IntellectualPropertyApplicationStatus.WITHDRAWN },
    { title: "Eliminated", value: IntellectualPropertyApplicationStatus.ELIMINATED }
];

export const intellectualPropertyApplicationStatusSr = [
    { title: "Obelodanjen", value: IntellectualPropertyApplicationStatus.DISCLOSED },
    { title: "U postupku", value: IntellectualPropertyApplicationStatus.PENDING },
    { title: "U pregovorima", value: IntellectualPropertyApplicationStatus.IN_NEGOTIATION },
    { title: "Odobren", value: IntellectualPropertyApplicationStatus.ALLOWED },
    { title: "Dodeljen / Registrovan", value: IntellectualPropertyApplicationStatus.GRANTED_OR_REGISTERED },
    { title: "Zaštićen", value: IntellectualPropertyApplicationStatus.PROTECTED },
    { title: "Ustupljen", value: IntellectualPropertyApplicationStatus.ASSIGNED },
    { title: "Prva fiksacija", value: IntellectualPropertyApplicationStatus.FIRST_FIXATION },
    { title: "Istekao", value: IntellectualPropertyApplicationStatus.EXPIRED },
    { title: "Povučen", value: IntellectualPropertyApplicationStatus.WITHDRAWN },
    { title: "Poništen", value: IntellectualPropertyApplicationStatus.ELIMINATED }
];

export const getIntellectualPropertyApplicationStatusTitleFromValue = (
    value: IntellectualPropertyApplicationStatus,
    intellectualPropertyApplicationStatusArray: {
        title: string,
        value: IntellectualPropertyApplicationStatus
    }[]
) => {
    return (
        intellectualPropertyApplicationStatusArray.find(item => item.value === value.toString()) || {}
    ).title;
};

export const getIntellectualPropertyApplicationStatusTitleFromValueAutoLocale = (
    value: IntellectualPropertyApplicationStatus | string
) => {
    const locale = i18n.vueI18n.global.locale;

    let intellectualPropertyApplicationStatusArray = intellectualPropertyApplicationStatusEn;

    if (locale === "sr") {
        intellectualPropertyApplicationStatusArray = intellectualPropertyApplicationStatusSr;
    } else if (locale === "sr-cyr") {
        intellectualPropertyApplicationStatusArray =
            transliterateContentToCyrillic(intellectualPropertyApplicationStatusSr);
    }

    return (
        intellectualPropertyApplicationStatusArray.find(item => item.value === value) || {}
    ).title;
};

export const getIntellectualPropertyApplicationStatusesForGivenLocale = () => {
    switch (i18n.vueI18n.global.locale) {
        case "sr":
            return intellectualPropertyApplicationStatusSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(intellectualPropertyApplicationStatusSr);
        case "en":
            return intellectualPropertyApplicationStatusEn;
    }

    return intellectualPropertyApplicationStatusEn;
};

export const isApplicationStatusApplicable = (type: IntellectualPropertyType, status: IntellectualPropertyApplicationStatus): boolean => {
    switch (status) {
        case IntellectualPropertyApplicationStatus.DISCLOSED:
        case IntellectualPropertyApplicationStatus.PROTECTED:
            return type === IntellectualPropertyType.DISCLOSURE;

        case IntellectualPropertyApplicationStatus.PENDING:
            return type === IntellectualPropertyType.PATENT
                || type === IntellectualPropertyType.TRADEMARK;

        case IntellectualPropertyApplicationStatus.IN_NEGOTIATION:
        case IntellectualPropertyApplicationStatus.ASSIGNED:
            return type === IntellectualPropertyType.LICENSE;

        case IntellectualPropertyApplicationStatus.ALLOWED:
        case IntellectualPropertyApplicationStatus.EXPIRED:
        case IntellectualPropertyApplicationStatus.WITHDRAWN:
            return type === IntellectualPropertyType.PATENT;

        case IntellectualPropertyApplicationStatus.GRANTED_OR_REGISTERED:
            return type === IntellectualPropertyType.PATENT
                || type === IntellectualPropertyType.REGISTERED_COPYRIGHT
                || type === IntellectualPropertyType.TRADEMARK;

        case IntellectualPropertyApplicationStatus.FIRST_FIXATION:
        case IntellectualPropertyApplicationStatus.ELIMINATED:
            return type === IntellectualPropertyType.REGISTERED_COPYRIGHT;

        default:
            return false;
    }
};
