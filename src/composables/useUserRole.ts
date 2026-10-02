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

    const canReviewDataQuality = computed(() =>
        isAdmin.value || isViceDeanForScience.value || isInstitutionalEditor.value);

    const canUserAddPersons = computed(() => isAdmin.value || isInstitutionalEditor.value || isInstitutionalLibrarian.value || isHeadOfLibrary.value);
    const canAddSerialEvents = computed(() => isAdmin.value || isInstitutionalEditor.value);

    const isLibrarianUser = computed(() => isHeadOfLibrary.value || isInstitutionalLibrarian.value);

    // The API reports -1 rather than null when a user is not bound to an institution, and -1 is
    // truthy, so it has to be normalised here or every caller has to remember the sentinel.
    const userInstitutionid = computed(() => {
        if (!isUserLoggedIn.value) {
            return undefined;
        }

        const institutionId = loggedInUser.value?.organisationUnitId;
        return institutionId && institutionId > 0 ? institutionId : undefined;
    });

    // Unlike isUserBoundToOU, which only looks at the role, this reflects whether the user
    // actually has an institution. Roles such as VICE_DEAN_FOR_SCIENCE may have none, in which
    // case they are not restricted to one.
    const hasInstitution = computed(() => Boolean(userInstitutionid.value));

    const canUserAddPublications = computed(() => userRole.value && userRole.value !== 'COMMISSION' && userRole.value !== 'VICE_DEAN_FOR_SCIENCE');
    const canUserAddProjects = computed(() => isAdmin.value || isResearcher.value || isInstitutionalEditor.value);
    const returnOnlyInstitutionRelatedEntities = ref(isUserBoundToOU.value);
    const loggedInUser = ref<UserResponse | null>(null);
    const isUserLoggedIn = computed(() => loggedInUser.value !== null);

    const loggedResearcherId = ref<number>(-1);
    
    const loginStore = useLoginStore();

    onMounted(() => {
        if (loginStore.userLoggedIn) {
            UserService.getLoggedInUser().then(response => {
                loggedInUser.value = response.data;

                if (!hasInstitution.value) {
                    returnOnlyInstitutionRelatedEntities.value = false;
                }
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
        canUserAddProjects,
        isUserBoundToOU, isInstitutionalEditor,
        returnOnlyInstitutionRelatedEntities,
        loggedInUser, isAdmin, isCommission,
        isResearcher, isViceDeanForScience,
        isInstitutionalLibrarian, isHeadOfLibrary,
        isPromotionRegistryAdministrator,
        canUserAddPersons, canAddSerialEvents,
        canReviewDataQuality,
        isUserLoggedIn, loggedResearcherId,
        isLibrarianUser, userInstitutionid,
        hasInstitution
    };
}
