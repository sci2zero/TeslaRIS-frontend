<template>
    <v-container>
        <h1>{{ $t("userProfileLabel") }}</h1>
        <br />
        <br />
        <user-profile-form></user-profile-form>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserProfileForm from '@/components/user/UserProfileForm.vue';

export default defineComponent({
    name: "UserProfileView",
    components: {UserProfileForm},
    setup() {
    }
});
</script>
