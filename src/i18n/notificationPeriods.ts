import { UserNotificationPeriod } from "@/models/UserModel";
import i18n from ".";

export const notificationPeriodSr = [
    { title: "Dnevno", value: UserNotificationPeriod.DAILY },
    { title: "Nedeljno", value: UserNotificationPeriod.WEEKLY },
    { title: "Nikada", value: UserNotificationPeriod.NEVER }
];

export const notificationPeriodEn = [
    { title: "Daily", value: UserNotificationPeriod.DAILY },
    { title: "Weekly", value: UserNotificationPeriod.WEEKLY },
    { title: "Never", value: UserNotificationPeriod.NEVER }
];

export const getTitleFromValueAutoLocale = (value: UserNotificationPeriod) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = notificationPeriodEn;
    if (locale == "sr") {
        resourceTypeArray = notificationPeriodSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getNotificationPeriodForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return notificationPeriodSr;
        case "en":
            return notificationPeriodEn;
    }
}
