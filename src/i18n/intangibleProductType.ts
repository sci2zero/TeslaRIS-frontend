import { IntangibleProductType } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const intangibleProductTypeEn = [
    { title: "Software", value: IntangibleProductType.SOFTWARE },
    { title: "Model", value: IntangibleProductType.MODEL },
    { title: "Process", value: IntangibleProductType.PROCESS },
    { title: "Method", value: IntangibleProductType.METHOD },
    { title: "Strategy", value: IntangibleProductType.STRATEGY },
    { title: "Policy", value: IntangibleProductType.POLICY },
    { title: "Framework", value: IntangibleProductType.FRAMEWORK },
    { title: "Invention", value: IntangibleProductType.INVENTION },
    { title: "Research technique", value: IntangibleProductType.RESEARCH_TECHNIQUE },
    { title: "Online resource", value: IntangibleProductType.ONLINE_RESOURCE },
    { title: "Test", value: IntangibleProductType.TEST },
    { title: "Website", value: IntangibleProductType.WEBSITE },
    { title: "Audio recording", value: IntangibleProductType.AUDIO_RECORDING },
    { title: "Radio/TV program", value: IntangibleProductType.RADIO_TV_PROGRAM },
    { title: "Video recording", value: IntangibleProductType.VIDEO_RECORDING },
    { title: "Sound design", value: IntangibleProductType.SOUND_DESIGN },
    { title: "Set design", value: IntangibleProductType.SET_DESIGN },
    { title: "Light design", value: IntangibleProductType.LIGHT_DESIGN },
    { title: "Choreography", value: IntangibleProductType.CHOREOGRAPHY },
    { title: "Standard", value: IntangibleProductType.STANDARD },
    { title: "Other", value: IntangibleProductType.OTHER }
];

export const intangibleProductTypeSr = [
    { title: "Softver", value: IntangibleProductType.SOFTWARE },
    { title: "Model", value: IntangibleProductType.MODEL },
    { title: "Proces", value: IntangibleProductType.PROCESS },
    { title: "Metoda", value: IntangibleProductType.METHOD },
    { title: "Strategija", value: IntangibleProductType.STRATEGY },
    { title: "Politika", value: IntangibleProductType.POLICY },
    { title: "Radni okvir", value: IntangibleProductType.FRAMEWORK },
    { title: "Pronalazak", value: IntangibleProductType.INVENTION },
    { title: "Istraživačka tehnika", value: IntangibleProductType.RESEARCH_TECHNIQUE },
    { title: "Mrežni resurs", value: IntangibleProductType.ONLINE_RESOURCE },
    { title: "Test", value: IntangibleProductType.TEST },
    { title: "Veb sajt", value: IntangibleProductType.WEBSITE },
    { title: "Audio-snimak", value: IntangibleProductType.AUDIO_RECORDING },
    { title: "Radio/TV program", value: IntangibleProductType.RADIO_TV_PROGRAM },
    { title: "Video snimak", value: IntangibleProductType.VIDEO_RECORDING },
    { title: "Dizajn zvuka", value: IntangibleProductType.SOUND_DESIGN },
    { title: "Scenografija", value: IntangibleProductType.SET_DESIGN },
    { title: "Dizajn svetla", value: IntangibleProductType.LIGHT_DESIGN },
    { title: "Koreografija", value: IntangibleProductType.CHOREOGRAPHY },
    { title: "Standard", value: IntangibleProductType.STANDARD },
    { title: "Ostalo", value: IntangibleProductType.OTHER }
];

export const getIntangibleProductTypeTitleFromValue = (
    value: IntangibleProductType, intangibleProductTypeArray: {title: string, value: IntangibleProductType}[]
) => {
    return (intangibleProductTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getIntangibleProductTypeTitleFromValueAutoLocale = (
    value: IntangibleProductType | string
) => {
    const locale = i18n.vueI18n.global.locale;

    let intangibleProductTypeArray = intangibleProductTypeEn;
    if (locale == "sr") {
        intangibleProductTypeArray = intangibleProductTypeSr;
    } else if (locale == "sr-cyr") {
        intangibleProductTypeArray = transliterateContentToCyrillic(intangibleProductTypeSr);
    }

    return (intangibleProductTypeArray.find(item => item.value === value) || {}).title;
};

export const getIntangibleProductTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return intangibleProductTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(intangibleProductTypeSr);
        case "en":
            return intangibleProductTypeEn;
    }
};
