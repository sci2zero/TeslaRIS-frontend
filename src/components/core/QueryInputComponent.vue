<template>
    <v-container>
        <v-row v-for="(clause, index) in queryClauses" :key="clause.id" class="d-flex flex-row justify-left">
            <v-col v-if="index > 0" cols="3">
                <v-select v-model="clause.operation" :items="operations" :label="$t('operationLabel')" dense />
            </v-col>
  
            <v-col cols="3">
                <v-select 
                    v-model="clause.field" 
                    :items="fields"
                    item-value="value"
                    :label="$t('fieldLabel')" 
                    dense
                />
            </v-col>
  
            <v-col cols="4">
                <v-text-field 
                    v-if="getFieldType(clause.field) === 'text'" 
                    v-model="clause.value" 
                    :label="$t('valueLabel')" 
                    dense 
                />
                <v-text-field 
                    v-else-if="getFieldType(clause.field) === 'number'" 
                    v-model.number="clause.value" 
                    :label="$t('valueLabel')" 
                    type="number" 
                    dense 
                />
                <date-picker
                    v-else-if="getFieldType(clause.field) === 'date'"
                    v-model="clause.value"
                    :label="$t('dateLabel')"
                    color="primary"
                ></date-picker>
            </v-col>
  
            <v-col cols="2" class="d-flex mb-5">
                <v-btn icon color="primary" @click="addClause(index + 1)">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn v-if="queryClauses.length > 1" icon color="red" @click="removeClause(clause.id)">
                    <v-icon>mdi-minus</v-icon>
                </v-btn>
            </v-col>
        </v-row>

        <v-row>
            <v-col class="d-flex justify-end">
                <v-btn :disabled="(queryClauses.find(clause => !clause.field || !clause.value) ? true : false)" color="primary" @click="emitQuery">
                    {{ $t("searchLabel") }}
                </v-btn>
                <v-btn class="ml-2" :disabled="((queryClauses.length == 1 && queryClauses.find(clause => !clause.field && !clause.value)) ? true : false)" color="primary" @click="resetQuery">
                    {{ $t("newSearchLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent, watch } from "vue";
import ThesisLibrarySearchService from "@/services/thesisLibrary/ThesisLibrarySearchService";
import DatePicker from "../core/DatePicker.vue";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { type SearchFieldsResponse } from "@/models/Common";
import { useI18n } from "vue-i18n";


interface QueryClause {
  id: string;
  operation: string;
  field: string;
  value: string;
}

export default defineComponent({
    name: "QueryInputComponent",
    components: { DatePicker },
    emits: ["search", "reset"],
    setup(_, {emit}) {
        const operations = ref(["AND", "OR", "NOT"]);
        const fieldData = ref<SearchFieldsResponse[]>([]);
        const fields = ref<{ title: string; value: string; type: string }[]>([]);

        const i18n = useI18n();

        const queryClauses = ref<QueryClause[]>([
            { id: self.crypto.randomUUID(), operation: "AND", field: "", value: "" }
        ]);

        const fetchFields = async () => {
            ThesisLibrarySearchService.getSearchFields(false).then(response => {
                fieldData.value = response.data;
                populateFieldData();
            });
        };

        onMounted(fetchFields);

        watch(i18n.locale, () => {
            populateFieldData();
        });

        const populateFieldData = () => {
            fields.value.splice(0);
            fieldData.value.forEach(searchField => {
                fields.value.push(
                    {
                        title: returnCurrentLocaleContent(searchField.b) as string,
                        value: searchField.a,
                        type: searchField.c
                    }
                );
            });
        };

        const addClause = (index: number) => {
            const newClause = { id: self.crypto.randomUUID(), operation: "AND", field: "", value: "" };

            if (index === queryClauses.value.length) {
                queryClauses.value.push(newClause);
                return;
            }
            
            queryClauses.value = [
                ...queryClauses.value.slice(0, index),
                newClause,
                ...queryClauses.value.slice(index)
            ];
        };

        const removeClause = (id: string) => {
            queryClauses.value = queryClauses.value.filter((clause) => clause.id !== id);
        };

        const getFieldType = (field: string) => {
            return fields.value.find((f) => f.value === field)?.type || "text";
        };

        const emitQuery = () => {
            const tokens: string[] = [];
            
            queryClauses.value.forEach((clause, index) => {
                if (index > 0) {
                    tokens.push(clause.operation);
                }

                tokens.push(`${clause.field}:${clause.value}`);
            });

            emit("search", tokens);
        };

        const resetQuery = () => {
            queryClauses.value.splice(0);
            queryClauses.value.push(
                {
                    id: self.crypto.randomUUID(),
                    operation: "AND",
                    field: "",
                    value: ""
                }
            );
            emit("reset");
        };

        return {
            queryClauses, operations,
            getFieldType, removeClause,
            emitQuery, addClause, fields,
            resetQuery
        };
    }
});
</script>
