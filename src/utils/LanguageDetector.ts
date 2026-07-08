import UserService from '@/services/UserService';
// Temporary disabled
// import { eld } from 'eld';


let initialized = false;


export async function initializeLanguageDetector(): Promise<void> {
    if (!initialized) {
        // await (eld as typeof eld & { load(): Promise<void> }).load();
        initialized = true;
    }
}

export async function detectLanguage(content: string): Promise<string | null> {
    if (!content?.trim()) {
        return null;
    }

    await initializeLanguageDetector();

    // const result = eld.detect(content);

    const loggedInUser = UserService.getLoggedInUser();
    // let locale = result?.language.toUpperCase() ?? 
    //     (await loggedInUser).data?.preferredReferenceCataloguingLanguage.toUpperCase();

    // if (locale === "HR") {
    //     locale = "SR";
    // }

    let locale = "SR"

    return locale;
}
