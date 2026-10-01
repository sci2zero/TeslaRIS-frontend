import { computed, inject, provide, type ComputedRef, type InjectionKey } from "vue";
import { useUserRole } from "@/composables/useUserRole";
import { UserRole } from "@/models/UserModel";
import { useLoginStore } from "@/stores/loginStore";

export { UserRole };

export interface PluginAuth {
    isLoggedIn: ComputedRef<boolean>;
    role: ComputedRef<string | undefined>;
    hasRole: (role: UserRole | string) => ComputedRef<boolean>;
    hasAnyRole: (...roles: Array<UserRole | string>) => ComputedRef<boolean>;
    isAdmin: ComputedRef<boolean>;
    isResearcher: ComputedRef<boolean>;
    isCommission: ComputedRef<boolean>;
    isInstitutionalEditor: ComputedRef<boolean>;
    isViceDeanForScience: ComputedRef<boolean>;
    isInstitutionalLibrarian: ComputedRef<boolean>;
    isHeadOfLibrary: ComputedRef<boolean>;
    isPromotionRegistryAdministrator: ComputedRef<boolean>;
    /** Admin, institutional editor, or vice dean for science. */
    canReviewDataQuality: ComputedRef<boolean>;
}

export const pluginAuthKey: InjectionKey<PluginAuth> = Symbol("teslaris.pluginAuth");

export function providePluginAuth(): PluginAuth {
    const loginStore = useLoginStore();
    const user = useUserRole();

    const auth: PluginAuth = {
        isLoggedIn: computed(() => loginStore.userLoggedIn),
        role: computed(() => user.userRole.value),
        hasRole: (role) => computed(() => user.userRole.value === role),
        hasAnyRole: (...roles) => computed(() =>
            !!user.userRole.value && roles.includes(user.userRole.value)
        ),
        isAdmin: user.isAdmin,
        isResearcher: user.isResearcher,
        isCommission: user.isCommission,
        isInstitutionalEditor: user.isInstitutionalEditor,
        isViceDeanForScience: user.isViceDeanForScience,
        isInstitutionalLibrarian: user.isInstitutionalLibrarian,
        isHeadOfLibrary: user.isHeadOfLibrary,
        isPromotionRegistryAdministrator: user.isPromotionRegistryAdministrator,
        canReviewDataQuality: user.canReviewDataQuality,
    };

    provide(pluginAuthKey, auth);
    return auth;
}

export function usePluginAuth(): PluginAuth {
    const auth = inject(pluginAuthKey);

    if (!auth) {
        throw new Error("[plugins] Auth is not provided. Call providePluginAuth() from the host app.");
    }

    return auth;
}
