import { ref } from "vue";
import { useI18n } from "vue-i18n";

export function useIdentifierCheck() {
    const i18n = useI18n();

    const message = ref("");
    const snackbar = ref(false);

    const checkIdentifiers = async (
        identifiers: { value: string; error: string }[],
        entityId: number,
        checkFunction: (identifier: string, entityId: number) => Promise<{ data: boolean }>
    ) => {
        const filteredIdentifiers = identifiers.filter(id => id.value);

        const results = await Promise.all(
            filteredIdentifiers.map(id => checkFunction(id.value as string, entityId))
        );

        const firstDuplicate = filteredIdentifiers.find((_, index) => results[index].data);
        if (firstDuplicate) {
            message.value = i18n.t(firstDuplicate.error);
            snackbar.value = true;
            return { duplicateFound: true, message, snackbar };
        }

        return { duplicateFound: false };
    };

    return { checkIdentifiers, message, snackbar };
}
