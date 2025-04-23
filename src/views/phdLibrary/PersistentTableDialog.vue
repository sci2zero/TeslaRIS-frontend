<template>
    <div class="text-center pa-4">
        <v-dialog
            v-model="dialog"
            max-width="1920"
            persistent
        >
            <v-card
                prepend-icon="mdi-printer-eye"
                :title="title"
            >
                <template #default>
                    <div class="overflow-auto">
                        <table class="table-auto border-collapse w-full">
                            <thead>
                                <tr class="bg-blue-100 text-left">
                                    <th v-for="(header, index) in headers" :key="index" class="p-2 border text-center" bgcolor="#4f90f7">
                                        <pre v-if="index==0" class="whitespace-pre-wrap break-words">{{ $t(header) }}</pre>
                                        <p v-else>
                                            {{ $t(header) }}
                                        </p>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, rowIndex) in rowData" :key="rowIndex">
                                    <td
                                        v-for="(cell, colIndex) in row"
                                        :key="colIndex"
                                        :class="'p-2 border align-top whitespace-pre-wrap' + (colIndex == 0 ? ' text-center' : '')"
                                    >
                                        <pre class="whitespace-pre-wrap break-words">{{ cell }}</pre>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>

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
    name: "PersistentTableDialog",
    props: {
        title: {
            type: String,
            required: true
        },
        headers: {
            type: Array<string>,
            required: true
        },
        rowData: {
            type: Array<string[]>,
            required: true
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