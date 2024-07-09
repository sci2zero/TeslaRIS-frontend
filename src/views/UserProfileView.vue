<template>
    <v-container>
        <h1>{{ $t("userProfileLabel") }}</h1>
        <br />
        <br />
        <user-profile-form></user-profile-form>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import UserProfileForm from '@/components/user/UserProfileForm.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: "UserProfileView",
    components: {UserProfileForm},
    setup() {
        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("userProfileLabel");
        });
    }
});
</script>
