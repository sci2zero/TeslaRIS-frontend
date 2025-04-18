<template>
    <v-breadcrumbs :items="breadcrumbItems">
        <template #divider>
            <v-icon>mdi-chevron-right</v-icon>
        </template>
    </v-breadcrumbs>
</template>
  
<script lang="ts">
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";


export default defineComponent({
    name: "BreadcrumbsNavigation",
    setup() {
        const route = useRoute();
        const router = useRouter();

        const i18n = useI18n();
    
        const breadcrumbItems = computed<any>(() => {
            const seenTitles = new Set();

            const breadcrumbs = route.matched
            .filter((matchedRoute) => matchedRoute.name && matchedRoute.name !== "home")
            .map((matchedRoute) => {
                let routeName = matchedRoute.name as string;
                routeName = routeName.replace("Parent", "");

                const isLastBreadcrumb = router.resolve(matchedRoute).fullPath === route.path;
                return {
                    title: matchedRoute.meta?.breadcrumb || i18n.t(`routeLabel.${routeName}`),
                    disabled: isLastBreadcrumb,
                    to: !isLastBreadcrumb ? router.resolve(matchedRoute).fullPath : undefined,
                }
            })
            .filter((item) => {
                if (seenTitles.has(item.title)) {
                    return false;
                }
                seenTitles.add(item.title);
                return true;
            });

            if (breadcrumbs.length > 1) return breadcrumbs; else return [];
        });
  
        return {
            breadcrumbItems,
        };
    },
});
</script>
  