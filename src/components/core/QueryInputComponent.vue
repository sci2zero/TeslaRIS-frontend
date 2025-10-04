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
    props: {
        searchFields: {
            type: Array<SearchFieldsResponse>,
            required: true
        },
        presetSearchInput: {
            type: String,
            default: ""
        }
    },
    emits: ["search", "reset"],
    setup(props, {emit}) {
        const operations = ref(["AND", "OR", "NOT"]);
        const fieldData = ref<SearchFieldsResponse[]>([]);
        const fields = ref<{ title: string; value: string; type: string }[]>([]);

        const i18n = useI18n();

        const queryClauses = ref<QueryClause[]>([
            { id: self.crypto.randomUUID(), operation: "AND", field: "", value: "" }
        ]);

        onMounted(() => {
            handleSearchFieldsChanged();
        });

        watch(i18n.locale, () => {
            populateFieldData();
        });

        watch(() => props.searchFields, () => {
            handleSearchFieldsChanged();
        });

        watch(() => props.presetSearchInput, () => {
            if (!props.presetSearchInput) {
                return;
            }

            const tokens = props.presetSearchInput.split("§").filter(t => t);

            if (tokens.length == 1 && tokens[0].trim() === "*") {
                return;
            }

            queryClauses.value.splice(0);

            if (tokens.length > 0 && tokens[0].trim() !== '') {
                const firstToken = tokens[0].trim();
                const firstFieldValue = firstToken.split(':');
                
                if (firstFieldValue.length === 2) {
                    queryClauses.value.push({
                        id: self.crypto.randomUUID(),
                        operation: "AND",
                        field: firstFieldValue[0].trim(),
                        value: firstFieldValue[1].trim()
                    });
                } else {
                    queryClauses.value.push({
                        id: self.crypto.randomUUID(),
                        operation: "AND",
                        field: "",
                        value: firstToken
                    });
                }
            }

            for (let i = 1; i < tokens.length; i++) {
                const currentToken = tokens[i].trim();
                if (!currentToken) continue;
                
                const isOperator = currentToken.toUpperCase() === "AND" || currentToken.toUpperCase() === "OR";
                
                if (isOperator) {
                    const nextToken = i + 1 < tokens.length ? tokens[i + 1].trim() : "";
                    
                    if (nextToken) {
                        const fieldValueParts = nextToken.split(':');
                        const operator = currentToken.toUpperCase();
                        
                        if (fieldValueParts.length === 2) {
                            queryClauses.value.push({
                                id: self.crypto.randomUUID(),
                                operation: operator,
                                field: fieldValueParts[0].trim(),
                                value: fieldValueParts[1].trim()
                            });
                        } else {
                            queryClauses.value.push({
                                id: self.crypto.randomUUID(),
                                operation: operator,
                                field: "",
                                value: nextToken
                            });
                        }
                        
                        i++;
                    } else {
                        queryClauses.value.push({
                            id: self.crypto.randomUUID(),
                            operation: currentToken.toUpperCase(),
                            field: "",
                            value: ""
                        });
                    }
                } else {
                    const fieldValueParts = currentToken.split(':');
                    
                    if (fieldValueParts.length === 2) {
                        queryClauses.value.push({
                            id: self.crypto.randomUUID(),
                            operation: "AND",
                            field: fieldValueParts[0].trim(),
                            value: fieldValueParts[1].trim()
                        });
                    } else {
                        queryClauses.value.push({
                            id: self.crypto.randomUUID(),
                            operation: "AND",
                            field: "",
                            value: currentToken
                        });
                    }
                }
            }

            emitQuery();
        }, { immediate: true });

        const handleSearchFieldsChanged = () => {
            if (props.searchFields) {
                fieldData.value = props.searchFields;
                populateFieldData();
            }
        };

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
