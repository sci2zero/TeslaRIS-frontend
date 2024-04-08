<template>
    <v-row v-for="(element, index) in uris" :key="index">
        <v-col cols="10">
            <v-text-field
                v-model="element.value" :label="$t('uriInputLabel')" placeholder="URI" outlined
                @input="sendContentToParent"></v-text-field>
        </v-col>
        <v-col cols="2">
            <v-btn v-if="index > 0" icon @click="removeUri(index)">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn icon @click="addUri">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: "UriInput",
    props: {
        modelValue: {
            type: Array<string>,
            required: true,
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const uris = ref([{value: ""}]);

        onMounted(() => {
            if (props.modelValue && props.modelValue.length > 0) {
                uris.value = [];
                props.modelValue.forEach((uri) => {
                    uris.value.push({value: uri});
                });
            }
        });

        const addUri = () => {
            uris.value.push({value: ""});
        };

        const removeUri = (index: number) => {
            uris.value.splice(index, 1);
        };

        const sendContentToParent = () => {
            const arrayOfUris: string[] = [];
            uris.value.forEach(uri => arrayOfUris.push(uri.value));
            emit("update:modelValue", arrayOfUris);
        };

        const clearInput = () => {
            uris.value = [];
        };


        return { uris, addUri, removeUri, sendContentToParent, clearInput };
    },
});
</script>