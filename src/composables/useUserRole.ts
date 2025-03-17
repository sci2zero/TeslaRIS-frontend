import { computed, ref, onMounted } from "vue";
import UserService from "@/services/UserService";
import { type UserResponse } from "@/models/UserModel";
import { useLoginStore } from "@/stores/loginStore";


export function useUserRole() {
    const userRole = UserService.provideUserRole();
    const isUserBoundToOU = computed(() => userRole && userRole !== "ADMIN" && userRole !== "RESEARCHER");
    const isAdmin = computed(() => userRole === "ADMIN");
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

    return {
        userRole,
        isUserBoundToOU,
        returnOnlyInstitutionRelatedEntities,
        loggedInUser, isAdmin
    };
}
