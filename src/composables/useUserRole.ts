import { computed, ref, onMounted, watch } from "vue";
import UserService from "@/services/UserService";
import { type UserResponse } from "@/models/UserModel";
import { useLoginStore } from "@/stores/loginStore";


export function useUserRole() {
    const userRole = ref(UserService.provideUserRole());
    const isUserBoundToOU = computed(() => userRole.value && userRole.value !== "ADMIN" && userRole.value !== "RESEARCHER");
    
    const isAdmin = computed(() => userRole.value === "ADMIN");
    const isResearcher = computed(() => userRole.value === "RESEARCHER");
    const isCommission = computed(() => userRole.value === "COMMISSION");
    const isInstitutionalEditor = computed(() => userRole.value === "INSTITUTIONAL_EDITOR");
    const isViceDeanForScience = computed(() => userRole.value === "VICE_DEAN_FOR_SCIENCE");
    const isInstitutionalLibrarian = computed(() => userRole.value === "INSTITUTIONAL_LIBRARIAN");
    const isHeadOfLibrary = computed(() => userRole.value === "HEAD_OF_LIBRARY");

    const canUserAddPublications = computed(() => userRole.value && userRole.value !== 'COMMISSION' && userRole.value !== 'VICE_DEAN_FOR_SCIENCE' && userRole.value !== 'HEAD_OF_LIBRARY');
    const returnOnlyInstitutionRelatedEntities = ref(isUserBoundToOU.value);
    const loggedInUser = ref<UserResponse | null>(null);
    
    const loginStore = useLoginStore();

    onMounted(() => {
        if (loginStore.userLoggedIn) {
            UserService.getLoggedInUser().then(response => {
                loggedInUser.value = response.data;
            });
        }
    });

    watch(() => loginStore.userLoggedIn, () => {
        userRole.value = UserService.provideUserRole();
    })

    return {
        userRole, canUserAddPublications,
        isUserBoundToOU, isInstitutionalEditor,
        returnOnlyInstitutionRelatedEntities,
        loggedInUser, isAdmin, isCommission,
        isResearcher, isViceDeanForScience,
        isInstitutionalLibrarian, isHeadOfLibrary
    };
}
