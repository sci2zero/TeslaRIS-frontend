import { computed, ref, onMounted, watch } from "vue";
import UserService from "@/services/UserService";
import { type UserResponse } from "@/models/UserModel";
import { useLoginStore } from "@/stores/loginStore";
import PersonService from "@/services/PersonService";


export function useUserRole() {
    const userRole = ref<string | undefined>(UserService.provideUserRole());
    const isUserBoundToOU = computed(() => userRole.value && userRole.value !== "ADMIN" && userRole.value !== "RESEARCHER");
    
    const isAdmin = computed(() => Boolean(userRole.value && userRole.value === "ADMIN"));
    const isResearcher = computed(() => Boolean(userRole.value && userRole.value === "RESEARCHER"));
    const isCommission = computed(() => Boolean(userRole.value && userRole.value === "COMMISSION"));
    const isInstitutionalEditor = computed(() => Boolean(userRole.value && userRole.value === "INSTITUTIONAL_EDITOR"));
    const isViceDeanForScience = computed(() => Boolean(userRole.value && userRole.value === "VICE_DEAN_FOR_SCIENCE"));
    const isInstitutionalLibrarian = computed(() => Boolean(userRole.value && userRole.value === "INSTITUTIONAL_LIBRARIAN"));
    const isHeadOfLibrary = computed(() => Boolean(userRole.value && userRole.value === "HEAD_OF_LIBRARY"));
    const isPromotionRegistryAdministrator = computed(() => Boolean(userRole.value && userRole.value === "PROMOTION_REGISTRY_ADMINISTRATOR"));

    const canUserAddPersons = computed(() => isAdmin.value || isInstitutionalEditor.value || isInstitutionalLibrarian.value);
    const canAddSerialEvents = computed(() => isAdmin.value || isInstitutionalEditor.value);

    const isLibrarianUser = computed(() => isHeadOfLibrary.value || isInstitutionalLibrarian.value);
    const userInstitutionid = computed(() => {
        if (isUserLoggedIn.value) {
            return loggedInUser.value?.organisationUnitId;
        }

        return undefined;
    });

    const canUserAddPublications = computed(() => userRole.value && userRole.value !== 'COMMISSION' && userRole.value !== 'VICE_DEAN_FOR_SCIENCE');
    const returnOnlyInstitutionRelatedEntities = ref(isUserBoundToOU.value);
    const loggedInUser = ref<UserResponse | null>(null);
    const isUserLoggedIn = computed(() => loggedInUser.value !== null);

    const loggedResearcherId = ref<number>(-1);
    
    const loginStore = useLoginStore();

    onMounted(() => {
        if (loginStore.userLoggedIn) {
            UserService.getLoggedInUser().then(response => {
                loggedInUser.value = response.data;
            });

            if (isResearcher.value) {
                PersonService.getPersonId().then(response => {
                    loggedResearcherId.value = response.data;
                });
            }
        }
    });

    watch(() => loginStore.userLoggedIn, () => {
        userRole.value = UserService.provideUserRole();
    });

    watch(() => loginStore.explicitlyLoggedOut, () => {
        userRole.value = undefined;
    });

    return {
        userRole, canUserAddPublications,
        isUserBoundToOU, isInstitutionalEditor,
        returnOnlyInstitutionRelatedEntities,
        loggedInUser, isAdmin, isCommission,
        isResearcher, isViceDeanForScience,
        isInstitutionalLibrarian, isHeadOfLibrary,
        isPromotionRegistryAdministrator,
        canUserAddPersons, canAddSerialEvents,
        isUserLoggedIn, loggedResearcherId,
        isLibrarianUser, userInstitutionid
    };
}
