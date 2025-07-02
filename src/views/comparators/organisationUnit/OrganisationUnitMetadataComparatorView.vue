<template>
    <v-container id="journal-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftOrganisationUnit?.name) }} {{ leftOrganisationUnit?.nameAbbreviation ? `(${leftOrganisationUnit?.nameAbbreviation})` : "" }}
                </h2>
                <br />

                <organisation-unit-update-form ref="updateLeftRef" :preset-o-u="leftOrganisationUnit" :in-modal="false" @update="updateLeft"></organisation-unit-update-form>

                <keyword-update-form ref="updateLeftKeywordsRef" :preset-keywords="(leftOrganisationUnit?.keyword as MultilingualContent[])" @update="updateLeftKeywords"></keyword-update-form>

                <br />

                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><b>{{ $t("researchAreasLabel") }}</b></div>
                        <research-area-hierarchy :research-areas="leftOrganisationUnit?.researchAreas" in-comparator></research-area-hierarchy>
                    </v-card-text>
                </v-card>

                <br />

                <v-card>
                    <v-card-text>
                        <div><b>{{ $t("relationsLabel") }}</b></div>
                        <organisation-unit-relation-update-form
                            ref="leftRelationsRef" :relations="leftRelations" :source-o-u="leftOrganisationUnit" in-comparator
                            @update="updateRightRelations"></organisation-unit-relation-update-form>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="1">
                <v-btn class="mb-1 middle-arrow" icon @click="moveAll(true)">
                    <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn class="mt-1 middle-arrow" icon @click="moveAll(false)">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
            </v-col>
            
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(rightOrganisationUnit?.name) }} {{ rightOrganisationUnit?.nameAbbreviation ? `(${rightOrganisationUnit?.nameAbbreviation})` : "" }}
                </h2>

                <br />

                <organisation-unit-update-form ref="updateRightRef" :preset-o-u="rightOrganisationUnit" :in-modal="false" @update="updateRight"></organisation-unit-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="(rightOrganisationUnit?.keyword as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><b>{{ $t("researchAreasLabel") }}</b></div>
                        <research-area-hierarchy :research-areas="rightOrganisationUnit?.researchAreas" in-comparator></research-area-hierarchy>
                    </v-card-text>
                </v-card>

                <br />

                <v-card>
                    <v-card-text>
                        <div><b>{{ $t("relationsLabel") }}</b></div>
                        <organisation-unit-relation-update-form
                            ref="rightRelationsRef" :relations="rightRelations" :source-o-u="rightOrganisationUnit" in-comparator
                            @update="updateRightRelations"></organisation-unit-relation-update-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <comparison-actions
            supports-force-delete :left-warning-message="leftWarningMessage" :right-warning-message="rightWarningMessage" @update="updateAll"
            @delete="deleteSide"></comparison-actions>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { onMounted, watch } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { mergeMultilingualContentField, returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import OrganisationUnitUpdateForm from '@/components/organisationUnit/update/OrganisationUnitUpdateForm.vue';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import type { MultilingualContent } from '@/models/Common';
import { ComparisonSide } from '@/models/MergeModel';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import type { OrganisationUnitRelationRequest, OrganisationUnitRelationResponse, OrganisationUnitRequest, OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import MergeService from '@/services/MergeService';
import { getErrorMessageForErrorKey } from '@/i18n';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import OrganisationUnitRelationUpdateForm from '@/components/organisationUnit/update/OrganisationUnitRelationUpdateForm.vue';
import Toast from '@/components/core/Toast.vue';


export default defineComponent({
    name: "OrganisationUnitMetadataComparator",
    components: { OrganisationUnitUpdateForm, KeywordUpdateForm, ComparisonActions, ResearchAreaHierarchy, OrganisationUnitRelationUpdateForm, Toast },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftOrganisationUnit = ref<OrganisationUnitResponse>();
        const rightOrganisationUnit = ref<OrganisationUnitResponse>();

        const leftUpdateRequest = ref<OrganisationUnitRequest>();
        const rightUpdateRequest = ref<OrganisationUnitRequest>();

        const leftRelations = ref<OrganisationUnitRelationResponse[]>([]);
        const rightRelations = ref<OrganisationUnitRelationResponse[]>([]);

        const updateLeftRef = ref<typeof OrganisationUnitUpdateForm>();
        const updateRightRef = ref<typeof OrganisationUnitUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();
        const leftRelationsRef = ref<typeof OrganisationUnitRelationUpdateForm>();
        const rightRelationsRef = ref<typeof OrganisationUnitRelationUpdateForm>();

        const leftWarningMessage = ref("");
        const rightWarningMessage = ref("");
        
        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("organisationUnitMetadataComparatorLabel");
            fetchOrganisationUnits();
            constructPotentialWarningMessages();
        });

        watch(i18n.locale, () => {
            constructPotentialWarningMessages();
        });

        const fetchOrganisationUnits = () => {
            OrganisationUnitService.readOU(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftOrganisationUnit.value = response.data;
                fetchLeftDetails();
            });

            OrganisationUnitService.readOU(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightOrganisationUnit.value = response.data;
                fetchRightDetails();
            });
        };

        const constructPotentialWarningMessages = () => {
            OrganisationUnitService.checkIfInstitutionalAdminsExist(parseInt(currentRoute.params.leftId as string)).then((response) => {
                if (response.data) {
                    leftWarningMessage.value = i18n.t("organisationUnitAdminExistsMessage");
                }
            });

            OrganisationUnitService.checkIfInstitutionalAdminsExist(parseInt(currentRoute.params.rightId as string)).then((response) => {
                if (response.data) {
                    rightWarningMessage.value = i18n.t("organisationUnitAdminExistsMessage");
                }
            });
        };

        const fetchLeftDetails = () => {
            OrganisationUnitService.getAllRelationsForSourceOU(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftRelations.value = response.data;
            });
        };

        const fetchRightDetails = () => {
            OrganisationUnitService.getAllRelationsForSourceOU(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightRelations.value = response.data;
            });
        };

        const mergeOrganisationUnitMetadata = (organisationUnit1: OrganisationUnitResponse, organisationUnit2: OrganisationUnitResponse) => {
            mergeMultilingualContentField(organisationUnit1.name, organisationUnit2.name);

            mergeMultilingualContentField(organisationUnit1.keyword, organisationUnit2.keyword);
            organisationUnit2.keyword = [];

            organisationUnit1.nameAbbreviation = organisationUnit2.nameAbbreviation;
            organisationUnit2.nameAbbreviation = "";
            organisationUnit1.scopusAfid = organisationUnit2.scopusAfid;
            organisationUnit2.scopusAfid = "";
            organisationUnit1.openAlexId = organisationUnit2.openAlexId;
            organisationUnit2.openAlexId = "";
            organisationUnit1.ror = organisationUnit2.ror;
            organisationUnit2.ror = "";

            organisationUnit1.contact!.contactEmail = organisationUnit2.contact?.contactEmail as string;
            organisationUnit1.contact!.phoneNumber = organisationUnit2.contact?.phoneNumber as string;
            organisationUnit2.contact!.contactEmail = "";
            organisationUnit2.contact!.phoneNumber = "";

            organisationUnit1.researchAreas = organisationUnit2.researchAreas;

            organisationUnit2.uris!.forEach(uri => {
                if (!organisationUnit1.uris!.includes(uri)) {
                    organisationUnit1.uris!.push(uri);
                }
            });
            organisationUnit2.uris = [];

            organisationUnit1.location!.latitude = organisationUnit2.location?.latitude as number;
            organisationUnit1.location!.longitude = organisationUnit2.location?.longitude as number;
            organisationUnit1.location!.address = organisationUnit2.location?.address;

            return [organisationUnit1, organisationUnit2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();

            if (fromLeftToRight) {
                [rightOrganisationUnit.value, leftOrganisationUnit.value] = mergeOrganisationUnitMetadata(rightOrganisationUnit.value as OrganisationUnitResponse, leftOrganisationUnit.value as OrganisationUnitResponse);
                rightRelations.value = leftRelations.value;
                leftRelations.value = [];
            } else {
                [leftOrganisationUnit.value, rightOrganisationUnit.value] = mergeOrganisationUnitMetadata(leftOrganisationUnit.value as OrganisationUnitResponse, rightOrganisationUnit.value as OrganisationUnitResponse);
                leftRelations.value = rightRelations.value;
                rightRelations.value = [];
            }

            updateLeftRef.value?.refreshForm();
            updateRightRef.value?.refreshForm();
            updateLeftKeywordsRef.value?.refreshForm();
            updateRightKeywordsRef.value?.refreshForm();
        };

        const leftUpdateComplete = ref(false);
        const rightUpdateComplete = ref(false);
        const update = ref(false);

        const updateLeft = (updatedData: OrganisationUnitRequest) => {
            leftOrganisationUnit.value!.name = updatedData.name;
            leftOrganisationUnit.value!.nameAbbreviation = updatedData.nameAbbreviation;
            leftOrganisationUnit.value!.scopusAfid = updatedData.scopusAfid;
            leftOrganisationUnit.value!.openAlexId = updatedData.openAlexId;
            leftOrganisationUnit.value!.ror = updatedData.ror;
            leftOrganisationUnit.value!.location = updatedData.location;
            leftOrganisationUnit.value!.contact = updatedData.contact;
            leftOrganisationUnit.value!.keyword = updatedData.keyword;
            leftOrganisationUnit.value!.uris = updatedData.uris;

            leftUpdateRequest.value = updatedData;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedData: OrganisationUnitRequest) => {
            rightOrganisationUnit.value!.name = updatedData.name;
            rightOrganisationUnit.value!.nameAbbreviation = updatedData.nameAbbreviation;
            rightOrganisationUnit.value!.scopusAfid = updatedData.scopusAfid;
            rightOrganisationUnit.value!.openAlexId = updatedData.openAlexId;
            rightOrganisationUnit.value!.ror = updatedData.ror;
            rightOrganisationUnit.value!.location = updatedData.location;
            rightOrganisationUnit.value!.contact = updatedData.contact;
            rightOrganisationUnit.value!.keyword = updatedData.keyword;
            rightOrganisationUnit.value!.uris = updatedData.uris;

            rightUpdateRequest.value = updatedData;
            
            if (update.value) {
                rightUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateAll = () => {
            update.value = true;
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();
            leftRelationsRef.value?.updateOURelations();
            rightRelationsRef.value?.updateOURelations();
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftOrganisationUnit.value!.keyword = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightOrganisationUnit.value!.keyword = keywords;
        };

        const updateLeftRelations = (newRelations: OrganisationUnitRelationRequest[], toDelete: number[]) => {
            updateRelations(newRelations, toDelete, true);
        };

        const updateRightRelations = (newRelations: OrganisationUnitRelationRequest[], toDelete: number[]) => {
            updateRelations(newRelations, toDelete, false);
        };

        const finishUpdates = async () => {
            if (leftUpdateComplete.value && rightUpdateComplete.value) {
                leftUpdateComplete.value = false;
                rightUpdateComplete.value = false;
                update.value = false;
                
                leftOrganisationUnit.value?.researchAreas.forEach(researchArea => {
                    leftUpdateRequest.value?.researchAreasId.push(researchArea.id as number);
                });

                rightOrganisationUnit.value?.researchAreas.forEach(researchArea => {
                    rightUpdateRequest.value?.researchAreasId.push(researchArea.id as number);
                });

                MergeService.saveMergedOrganisationUnitsMetadata(
                    leftOrganisationUnit.value?.id as number, rightOrganisationUnit.value?.id as number,
                    {
                        leftOrganisationUnit: leftUpdateRequest.value as OrganisationUnitRequest,
                        rightOrganisationUnit: rightUpdateRequest.value as OrganisationUnitRequest
                    }
                )
                .then(() => {
                    snackbarMessage.value = i18n.t("updatedSuccessMessage");
                    snackbar.value = true;
                })
                .catch((error) => {
                    snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                    snackbar.value = true;
                });
            }
        };

        const deleteSide = async (side: ComparisonSide, isForceDelete = false) => {
            const id = side === ComparisonSide.LEFT ? leftOrganisationUnit.value?.id as number : rightOrganisationUnit.value?.id as number;
            const name = side === ComparisonSide.LEFT ? leftOrganisationUnit.value?.name : rightOrganisationUnit.value?.name;
            const transferTargetId = side === ComparisonSide.LEFT ? rightOrganisationUnit.value?.id : leftOrganisationUnit.value?.id;

            try {
                const deleteAction = isForceDelete 
                    ? OrganisationUnitService.forceDeleteOrganisationUnit(id)
                    : OrganisationUnitService.deleteOrganisationUnit(id);

                await deleteAction;

                await MergeService.switchAllIndicatorsToOtherOrganisationUnit(id as number, transferTargetId as number);

                router.push({ name: "deduplication", query: { tab: "organisationUnits" } });
            } catch (_error) {
                snackbarMessage.value = i18n.t(
                    "deleteFailedNotification",
                    { name: returnCurrentLocaleContent(name) }
                );
                snackbar.value = true;
            }
        };

        const updateRelations = async (newRelations: OrganisationUnitRelationRequest[], toDelete: number[], left: boolean) => {
            await Promise.all(toDelete.map(relationIdToDelete => OrganisationUnitService.deleteOURelation(relationIdToDelete)));

            const relationsForUpdate = newRelations.filter(relation => relation.id);
            const relationsToAdd = newRelations.filter(relation => !relation.id);

            if (relationsForUpdate.length === 0) {
                await addNewRelations(relationsToAdd, left);
                return;
            }

            await Promise.all(relationsForUpdate.map(relation => OrganisationUnitService.updateOURelation(relation, relation.id)));

            if (relationsToAdd.length > 0) {
                await addNewRelations(relationsToAdd, left);
            }

            await fetchAndSetRelations(left);
        };

        const addNewRelations = async (relationsToAdd: OrganisationUnitRelationRequest[], left: boolean) => {
            await Promise.all(relationsToAdd.map(relation => OrganisationUnitService.createOURelation(relation)));
            await fetchAndSetRelations(left);
        };

        const fetchAndSetRelations = async (left: boolean) => {
            const sourceOUId = parseInt(left ? currentRoute.params.leftId as string : currentRoute.params.rightId as string);
            const response = await OrganisationUnitService.getAllRelationsForSourceOU(sourceOUId);
            if (left) {
                leftRelations.value = response.data;
            } else {
                rightRelations.value = response.data;
            }
        };

        return {
            returnCurrentLocaleContent, snackbarMessage,
            leftOrganisationUnit, rightOrganisationUnit,
            moveAll, updateAll, updateLeft, deleteSide,
            updateLeftRef, updateRightRef, updateRight,
            updateLeftKeywords, updateRightKeywords,
            updateRightKeywordsRef, updateLeftKeywordsRef,
            leftRelations, rightRelations, snackbar,
            leftRelationsRef, rightRelationsRef,
            updateLeftRelations, updateRightRelations,
            leftWarningMessage, rightWarningMessage
        };
}})

</script>
