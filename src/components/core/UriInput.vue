<template>
    <v-row v-for="(uri, index) in uris" :key="index">
        <v-col cols="9">
            <v-text-field
                v-model="uri.value" :label="$t('uriInputLabel')" placeholder="URI" outlined
                @input="sendContentToParent"></v-text-field>
        </v-col>
        <v-col cols="3">
            <v-btn icon @click="addUri">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn v-if="index > 0" icon @click="removeUri(index)">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: "UriInput",
    emits: ["setInput"],
    setup({emit}) {
        const uris = ref([""]);

        const addUri = () => {
        uris.value.push("");
        };

        const removeUri = (index: number) => {
        uris.value.splice(index, 1);
        };

        const sendContentToParent = () => {
            emit("setInput", uris.value);
        };

        const clearInput = () => {
            uris.value = [];
        };


        return { uris, addUri, removeUri, sendContentToParent, clearInput };
    },
});
</script>