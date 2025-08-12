<template>
    <div class="mt-5 mb-5">
        <a
            :href="`${basePath}oauth2/authorization/orcid`"
            class="orcid-btn"
            role="button"
            aria-label="Sign in with ORCID">
            <img
                src="@/assets/oauth2/orcid_logo.png"
                alt="ORCID logo"
                class="orcid-logo"
            />
            {{ $t("signInWithOrcidLabel") }}
        </a>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';


  export default defineComponent({
    name: "OAuth2ButtonsSection",
    setup() {
        const basePath: string = (import.meta.env.VITE_BASE_URL as string)
            .replace("api/", "")
            .replace("localhost", "127.0.0.1"); // used only for local development

        return {
            basePath
        };
    }
  });
</script>

<style>

.orcid-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background-color: white;
    color: #000;
    font-weight: 600;
    font-family: Arial, sans-serif;
    text-decoration: none;
    padding: 10px 20px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
    user-select: none;
    outline: 1px solid #000;
}

.orcid-btn:hover, .orcid-btn:focus-visible {
    background-color: #8BBF22;
    outline: 2px solid #000;
    outline-offset: 2px;
}

.orcid-logo {
    width: 20px;
    height: 20px;
    object-fit: contain;
}

</style>
