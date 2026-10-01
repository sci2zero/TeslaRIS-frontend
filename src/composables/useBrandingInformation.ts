import { computed, onMounted, ref } from 'vue';
import BrandingService from '@/services/BrandingService';
import type { BrandingInformation } from '@/models/Common';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


// Module level so every consumer shares one copy. Each mounting component still
// refetches, so a change made by an admin is picked up without a page reload.
const brandingInformation = ref<BrandingInformation>({
    title: [],
    description: [],
    location: undefined,
    postalAddress: undefined,
    phoneNumber: undefined
});
const loaded = ref(false);

// Read-only accessor for code that needs the branding but must not trigger
// a fetch of its own.
export const brandingInformationState = brandingInformation;

export const fetchBrandingInformation = async () => {
    try {
        const response = await BrandingService.fetchBrandingInfo();
        brandingInformation.value = response.data;
        loaded.value = true;
    } catch (error) {
        console.error("Failed to fetch branding information:", error);
    }
};

export function useBrandingInformation() {
    const title = computed(() => brandingInformation.value.title);
    const description = computed(() => brandingInformation.value.description);
    const location = computed(() => brandingInformation.value.location);
    const postalAddress = computed(() => brandingInformation.value.postalAddress);
    const phoneNumber = computed(() => brandingInformation.value.phoneNumber);

    const formattedAddress = computed(() => {
        const mapAddress = brandingInformation.value.location?.address;
        if (mapAddress) {
            return mapAddress;
        }

        const address = brandingInformation.value.postalAddress;
        if (!address) {
            return "";
        }

        const cityLine = [address.postalNumber, returnCurrentLocaleContent(address.city)]
            .filter(part => !!part)
            .join(" ");

        return [
            returnCurrentLocaleContent(address.streetAndNumber),
            cityLine,
            returnCurrentLocaleContent(address.state)
        ].filter(part => !!part && part.trim().length > 0).join(", ");
    });

    const hasLocation = computed(() =>
        !!brandingInformation.value.location?.latitude &&
        !!brandingInformation.value.location?.longitude);

    onMounted(fetchBrandingInformation);

    return {
        brandingInformation, loaded, fetchBrandingInformation,
        title, description, location, postalAddress, phoneNumber,
        formattedAddress, hasLocation
    };
}
