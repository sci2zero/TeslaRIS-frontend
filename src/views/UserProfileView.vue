<template>
    <div class="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <header class="mb-6">
            <h1 class="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
                {{ $t("userProfileLabel") }}
            </h1>
        </header>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <user-profile-form />
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import UserProfileForm from '@/components/user/UserProfileForm.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: "UserProfileView",
    components: { UserProfileForm },
    setup() {
        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("userProfileLabel");
        });
    }
});
</script>
