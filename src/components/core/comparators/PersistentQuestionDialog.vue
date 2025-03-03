<template>
    <div class="text-center pa-4">
        <v-dialog
            v-model="dialog"
            max-width="400"
            persistent
        >
            <v-card
                prepend-icon="mdi-alert"
                :text="message"
                :title="title"
            >
                <template #actions>
                    <v-spacer></v-spacer>
  
                    <v-btn @click="dialog = false">
                        {{ $t("cancelLabel") }}
                    </v-btn>
  
                    <v-btn @click="dialog = false; continueOperation();">
                        {{ $t("continueLabel") }}
                    </v-btn>
                </template>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';


export default defineComponent({
    name: "PersistentQuestionDialog",
    props: {
        message: {
            type: String,
            default: ""
        },
        title: {
            type: String,
            default: ""
        }
    },
    emits: ["continue"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const toggle = () => {
            dialog.value = !dialog.value;
        };

        const continueOperation = () => {
            emit("continue");
        };

        return { 
            dialog, toggle, continueOperation
        };
    },
});
</script>