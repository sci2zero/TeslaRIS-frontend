<template>
    <v-container id="journal-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftOrganisationUnit?.name) }} {{ leftOrganisationUnit?.nameAbbreviation ? `(${returnCurrentLocaleContent(leftOrganisationUnit?.nameAbbreviation)})` : "" }}
                </h2>
                <br />

                <organisation-unit-update-form
                    ref="updateLeftRef"
                    :preset-o-u="leftOrganisationUnit"
                    :in-modal="false"
                    @update="updateLeft"
                />

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftOrganisationUnit?.keyword as MultilingualContent[])"
                    @update="updateLeftKeywords"
                />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftOrganisationUnit?.description as MultilingualContent[])"
                    :placeholder-label="$t('descriptionLabel')"    
                    @update="updateLeftDescription">
                </description-or-biography-update-form>

                <br />

                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><b>{{ $t("researchAreasLabel") }}</b></div>
                        <research-area-hierarchy
                            :research-areas="leftOrganisationUnit?.researchAreas"
                            in-comparator>
                        </research-area-hierarchy>
                    </v-card-text>
                </v-card>

                <br />

                <v-card>
                    <v-card-text>
                        <div><b>{{ $t("relationsLabel") }}</b></div>
                        <organisation-unit-relation-update-form
                            ref="leftRelationsRef"
                            :relations="leftRelations"
                            :source-o-u="leftOrganisationUnit"
                            in-comparator
                            @update="updateLeftRelations">
                        </organisation-unit-relation-update-form>
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
                    {{ returnCurrentLocaleContent(rightOrganisationUnit?.name) }} {{ rightOrganisationUnit?.nameAbbreviation ? `(${returnCurrentLocaleContent(rightOrganisationUnit?.nameAbbreviation)})` : "" }}
                </h2>

                <br />

                <organisation-unit-update-form
                    ref="updateRightRef"
                    :preset-o-u="rightOrganisationUnit"
                    :in-modal="false"
                    @update="updateRight"
                />

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightOrganisationUnit?.keyword as MultilingualContent[])"
                    @update="updateRightKeywords"
                />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightOrganisationUnit?.description as MultilingualContent[])"
                    :placeholder-label="$t('descriptionLabel')"
                    @update="updateRightDescription">
                </description-or-biography-update-form>

                <br />

                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><b>{{ $t("researchAreasLabel") }}</b></div>
                        <research-area-hierarchy
                            :research-areas="rightOrganisationUnit?.researchAreas"
                            in-comparator>
                        </research-area-hierarchy>
                    </v-card-text>
                </v-card>

                <br />

                <v-card>
                    <v-card-text>
                        <div><b>{{ $t("relationsLabel") }}</b></div>
                        <organisation-unit-relation-update-form
                            ref="rightRelationsRef"
                            :relations="rightRelations"
                            :source-o-u="rightOrganisationUnit"
                            in-comparator
                            @update="updateRightRelations">
                        </organisation-unit-relation-update-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :supports-force-delete="isAdmin"
            :left-warning-message="leftWarningMessage"
            :right-warning-message="rightWarningMessage"
            aggregated-entities-comparison-page="organisationUnitEmploymentsComparator"
            :left-id="(leftOrganisationUnit?.id as number)"
            :right-id="(rightOrganisationUnit?.id as number)"
            :entity-type="EntityType.ORGANISATION_UNIT"
            @update="updateAll"
            @delete="deleteSide"
        />

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
import { ComparisonSide, EntityType } from '@/models/MergeModel';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import type { OrganisationUnitRelationRequest, OrganisationUnitRelationResponse, OrganisationUnitRequest, OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import MergeService from '@/services/MergeService';
import { getErrorMessageForErrorKey } from '@/i18n';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import OrganisationUnitRelationUpdateForm from '@/components/organisationUnit/update/OrganisationUnitRelationUpdateForm.vue';
import Toast from '@/components/core/Toast.vue';
import { useUserRole } from '@/composables/useUserRole';
import { bulkTransferFields } from '@/utils/FieldTransferUtil';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';


export default defineComponent({
    name: "OrganisationUnitMetadataComparator",
    components: { OrganisationUnitUpdateForm, KeywordUpdateForm, ComparisonActions, ResearchAreaHierarchy, OrganisationUnitRelationUpdateForm, Toast, DescriptionOrBiographyUpdateForm },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const { isAdmin } = useUserRole();

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
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
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

            mergeMultilingualContentField(organisationUnit1.description, organisationUnit2.description);
            organisationUnit2.description = [];

            mergeMultilingualContentField(organisationUnit1.keyword, organisationUnit2.keyword);
            organisationUnit2.keyword = [];

            mergeMultilingualContentField(organisationUnit1.nameAbbreviation, organisationUnit2.nameAbbreviation);
            organisationUnit2.nameAbbreviation = [];

            organisationUnit1.postalAddress = organisationUnit2.postalAddress;
            organisationUnit2.postalAddress = undefined;

            bulkTransferFields(organisationUnit1, organisationUnit2, [
                { fieldName: "scopusAfid", emptyValue: "" },
                { fieldName: "openAlexId", emptyValue: "" },
                { fieldName: "ror", emptyValue: "" },
                { fieldName: "ringgold", emptyValue: "" },
                { fieldName: "fundref", emptyValue: "" },
                { fieldName: "isni", emptyValue: "" },
                { fieldName: "athensId", emptyValue: "" },
                { fieldName: "ncesId", emptyValue: "" },
                { fieldName: "fctId", emptyValue: "" },
                { fieldName: "dgeecId", emptyValue: "" },
                { fieldName: "nifId", emptyValue: "" },
                { fieldName: "allowedThesisTypes", emptyValue: [] },
                { fieldName: "clientInstitutionCris", emptyValue: false },
                { fieldName: "validatingEmailDomainCris", emptyValue: false },
                { fieldName: "allowingSubdomainsCris", emptyValue: false },
                { fieldName: "institutionEmailDomainCris", emptyValue: "" },
                { fieldName: "clientInstitutionDl", emptyValue: false },
                { fieldName: "validatingEmailDomainDl", emptyValue: false },
                { fieldName: "allowingSubdomainsDl", emptyValue: false },
                { fieldName: "institutionEmailDomainDl", emptyValue: "" },
                { fieldName: "legalEntity", emptyValue: false, setEmpty: false },
                { fieldName: "startup", emptyValue: false, setEmpty: false },
                { fieldName: "dateEstablished", emptyValue: null },
                { fieldName: "contact.contactEmail", emptyValue: "", nested: true },
                { fieldName: "contact.phoneNumber", emptyValue: "", nested: true },
                { fieldName: "location.latitude", emptyValue: null, nested: true, setEmpty: false },
                { fieldName: "location.longitude", emptyValue: null, nested: true, setEmpty: false },
                { fieldName: "location.address", emptyValue: null, nested: true, setEmpty: false }
            ]);

            organisationUnit1.researchAreas = organisationUnit2.researchAreas;
            organisationUnit1.sector = organisationUnit2.sector;

            organisationUnit2.uris!.forEach(uri => {
                if (!organisationUnit1.uris!.includes(uri)) {
                    organisationUnit1.uris!.push(uri);
                }
            });
            organisationUnit2.uris = [];

            return [organisationUnit1, organisationUnit2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();

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
            updateLeftDescriptionRef.value?.refreshForm();
            updateRightDescriptionRef.value?.refreshForm();
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
            leftOrganisationUnit.value!.ringgold = updatedData.ringgold;
            leftOrganisationUnit.value!.fundref = updatedData.fundref;
            leftOrganisationUnit.value!.isni = updatedData.isni;
            leftOrganisationUnit.value!.athensId = updatedData.athensId;
            leftOrganisationUnit.value!.ncesId = updatedData.ncesId;
            leftOrganisationUnit.value!.nifId = updatedData.nifId;
            leftOrganisationUnit.value!.dgeecId = updatedData.dgeecId;
            leftOrganisationUnit.value!.fctId = updatedData.fctId;
            leftOrganisationUnit.value!.location = updatedData.location;
            leftOrganisationUnit.value!.contact = updatedData.contact;
            leftOrganisationUnit.value!.description = updatedData.description;
            leftOrganisationUnit.value!.keyword = updatedData.keyword;
            leftOrganisationUnit.value!.uris = updatedData.uris;
            leftOrganisationUnit.value!.allowedThesisTypes = updatedData.allowedThesisTypes;
            leftOrganisationUnit.value!.clientInstitutionCris = updatedData.clientInstitutionCris;
            leftOrganisationUnit.value!.validatingEmailDomainCris = updatedData.validatingEmailDomainCris;
            leftOrganisationUnit.value!.allowingSubdomainsCris = updatedData.allowingSubdomainsCris;
            leftOrganisationUnit.value!.institutionEmailDomainCris = updatedData.institutionEmailDomainCris;
            leftOrganisationUnit.value!.clientInstitutionDl = updatedData.clientInstitutionDl;
            leftOrganisationUnit.value!.validatingEmailDomainDl = updatedData.validatingEmailDomainDl;
            leftOrganisationUnit.value!.allowingSubdomainsDl = updatedData.allowingSubdomainsDl;
            leftOrganisationUnit.value!.institutionEmailDomainDl = updatedData.institutionEmailDomainDl;
            leftOrganisationUnit.value!.legalEntity = updatedData.legalEntity;
            leftOrganisationUnit.value!.sector = updatedData.sector;
            leftOrganisationUnit.value!.startup = updatedData.startup;
            leftOrganisationUnit.value!.dateEstablished = updatedData.dateEstablished;
            leftOrganisationUnit.value!.postalAddress = updatedData.postalAddress;

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
            rightOrganisationUnit.value!.ringgold = updatedData.ringgold;
            rightOrganisationUnit.value!.fundref = updatedData.fundref;
            rightOrganisationUnit.value!.isni = updatedData.isni;
            rightOrganisationUnit.value!.athensId = updatedData.athensId;
            rightOrganisationUnit.value!.ncesId = updatedData.ncesId;
            rightOrganisationUnit.value!.nifId = updatedData.nifId;
            rightOrganisationUnit.value!.dgeecId = updatedData.dgeecId;
            rightOrganisationUnit.value!.fctId = updatedData.fctId;
            rightOrganisationUnit.value!.location = updatedData.location;
            rightOrganisationUnit.value!.contact = updatedData.contact;
            rightOrganisationUnit.value!.description = updatedData.description;
            rightOrganisationUnit.value!.keyword = updatedData.keyword;
            rightOrganisationUnit.value!.uris = updatedData.uris;
            rightOrganisationUnit.value!.allowedThesisTypes = updatedData.allowedThesisTypes;
            rightOrganisationUnit.value!.clientInstitutionCris = updatedData.clientInstitutionCris;
            rightOrganisationUnit.value!.validatingEmailDomainCris = updatedData.validatingEmailDomainCris;
            rightOrganisationUnit.value!.allowingSubdomainsCris = updatedData.allowingSubdomainsCris;
            rightOrganisationUnit.value!.institutionEmailDomainCris = updatedData.institutionEmailDomainCris;
            rightOrganisationUnit.value!.clientInstitutionDl = updatedData.clientInstitutionDl;
            rightOrganisationUnit.value!.validatingEmailDomainDl = updatedData.validatingEmailDomainDl;
            rightOrganisationUnit.value!.allowingSubdomainsDl = updatedData.allowingSubdomainsDl;
            rightOrganisationUnit.value!.institutionEmailDomainDl = updatedData.institutionEmailDomainDl;
            rightOrganisationUnit.value!.legalEntity = updatedData.legalEntity;
            rightOrganisationUnit.value!.sector = updatedData.sector;
            rightOrganisationUnit.value!.startup = updatedData.startup;
            rightOrganisationUnit.value!.dateEstablished = updatedData.dateEstablished;
            rightOrganisationUnit.value!.postalAddress = updatedData.postalAddress;

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
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
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

        const updateLeftDescription = (description: MultilingualContent[]) => {
            leftOrganisationUnit.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightOrganisationUnit.value!.description = description;
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

                await MergeService.migrateOrganisationUnitIdentifierHistory(id, transferTargetId as number);
                await MergeService.switchAllIndicatorsToOtherOrganisationUnit(id as number, transferTargetId as number);

                router.push({ name: "organisationUnitLandingPage", params: { id: transferTargetId } });
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
            leftRelationsRef, rightRelationsRef, isAdmin,
            updateLeftRelations, updateRightRelations,
            leftWarningMessage, rightWarningMessage,
            EntityType, updateLeftDescription,
            updateRightDescription, updateLeftDescriptionRef,
            updateRightDescriptionRef
        };
}})

</script>
