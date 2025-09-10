import { createRouter, createWebHistory } from "vue-router";
import { defaultLocale } from '@/i18n'

import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import UserListView from "@/views/UserListView.vue";
import EventListView from "@/views/EventListView.vue";
import PersonListView from "@/views/PersonListView.vue";
import AccountActivationView from "@/views/AccountActivationView.vue";
import OrganisationUnitListView from "@/views/OrganisationUnitListView.vue";
import ScientificResultsView from "@/views/ScientificResultsView.vue";
import JournalListView from "@/views/JournalListView.vue";
import BookSeriesListView from "@/views/BookSeriesListView.vue";
import PublisherListView from "@/views/PublisherListView.vue";
import AdvancedSearchView from "@/views/AdvancedSearchView.vue";
import UserProfileView from "@/views/UserProfileView.vue";
import SubmitConferenceView from "@/views/SubmitConferenceView.vue";
import SubmitPublisherView from "@/views/SubmitPublisherView.vue";
import SubmitPersonView from "@/views/SubmitPersonView.vue";
import SubmitOrganisationUnitView from "@/views/SubmitOrganisationUnitView.vue";
import SubmitJournalView from "@/views/SubmitJournalView.vue";
import SubmitBookSeriesView from "@/views/SubmitBookSeriesView.vue";
import SubmitJournalPublicationView from "@/views/SubmitJournalPublicationView.vue";
import SubmitProceedingsView from "@/views/SubmitProceedingsView.vue";
import SubmitProceedingsPublicationView from "@/views/SubmitProceedingsPublicationView.vue";
import ResetPasswordView from "@/views/ResetPasswordView.vue";
import SubmitPatentView from "@/views/SubmitPatentView.vue";
import SubmitSoftwareView from "@/views/SubmitSoftwareView.vue";
import SubmitDatasetView from "@/views/SubmitDatasetView.vue";
import ExternalRedirect from "@/components/core/ExternalRedirect.vue";
import ResearcherLandingView from "@/views/landingPages/ResearcherLandingView.vue";
import OrgUnitLandingView from "@/views/landingPages/OrgUnitLandingView.vue";
import JournalLandingView from "@/views/landingPages/JournalLandingView.vue";
import ConferenceLandingView from "@/views/landingPages/ConferenceLandingView.vue";
import BookSeriesLandingView from "@/views/landingPages/BookSeriesLandingView.vue";
import PublisherLandingView from "@/views/landingPages/PublisherLandingView.vue";
import JournalPublicationLandingView from "@/views/landingPages/JournalPublicationLandingView.vue";
import SoftwareLandingView from "@/views/landingPages/SoftwareLandingView.vue";
import DatasetLandingView from "@/views/landingPages/DatasetLandingView.vue";
import PatentLandingView from "@/views/landingPages/PatentLandingView.vue";
import ProceedingsPublicationsLandingView from "@/views/landingPages/ProceedingsPublicationsLandingView.vue";
import ProceedingsLandingView from "@/views/landingPages/ProceedingsLandingView.vue";
import SubmitMonographView from "@/views/SubmitMonographView.vue";
import MonographLandingView from "@/views/landingPages/MonographLandingView.vue";
import HarvesterView from "@/views/HarvesterView.vue";
import LoaderView from "@/views/LoaderView.vue";
import JournalPublicationsComparatorView from "@/views/comparators/journal/JournalPublicationsComparatorView.vue";
import JournalMetadataComparatorView from "@/views/comparators/journal/JournalMetadataComparatorView.vue";
import PersonPublicationsComparatorView from "@/views/comparators/person/PersonPublicationsComparatorView.vue";
import PersonMetadataComparatorView from "@/views/comparators/person/PersonMetadataComparatorView.vue";
import OrganisationUnitEmployeeComparatorView from "@/views/comparators/organisationUnit/OrganisationUnitEmployeeComparatorView.vue";
import EventProceedingsComparatorView from "@/views/comparators/event/EventProceedingsComparatorView.vue";
import ProceedingsPublicationsComparatorView from "@/views/comparators/proceedings/ProceedingsPublicationsComparatorView.vue";
import ProceedingsMetadataComparatorView from "@/views/comparators/proceedings/ProceedingsMetadataComparatorView.vue";
import EventMetadataComparatorView from "@/views/comparators/event/EventMetadataComparatorView.vue";
import SubmitMonographPublicationView from "@/views/SubmitMonographPublicationView.vue";
import MonographPublicationLandingView from "@/views/landingPages/MonographPublicationLandingView.vue";
import SubmitThesisView from "@/views/SubmitThesisView.vue";
import ThesisLandingView from "@/views/landingPages/ThesisLandingView.vue";
import NotificationsView from "@/views/NotificationsView.vue";
import DeduplicationView from "@/views/DeduplicationView.vue";
import SoftwareMetadataComparatorView from "@/views/comparators/documents/SoftwareMetadataComparatorView.vue";
import DatasetMetadataComparatorView from "@/views/comparators/documents/DatasetMetadataComparatorView.vue";
import PatentMetadataComparatorView from "@/views/comparators/documents/PatentMetadataComparatorView.vue";
import ProceedingsPublicationComparatorView from "@/views/comparators/documents/ProceedingsPublicationComparatorView.vue";
import ThesisMetadataComparatorView from "@/views/comparators/documents/ThesisMetadataComparatorView.vue";
import JournalPublicationMetadataComparatorView from "@/views/comparators/documents/JournalPublicationMetadataComparatorView.vue";
import MonographPublicationsComparatorView from "@/views/comparators/documents/MonographPublicationsComparatorView.vue";
import MonographMetadataComparatorView from "@/views/comparators/documents/MonographMetadataComparatorView.vue";
import MonographPublicationMetadataComparatorView from "@/views/comparators/documents/MonographPublicationMetadataComparatorView.vue";
import BookSeriesMetadataComparatorView from "@/views/comparators/bookSeries/BookSeriesMetadataComparatorView.vue";
import BookSeriesPublicationsComparatorView from "@/views/comparators/bookSeries/BookSeriesPublicationsComparatorView.vue";
import OrganisationUnitMetadataComparatorView from "@/views/comparators/organisationUnit/OrganisationUnitMetadataComparatorView.vue";
import CountryListView from "@/views/CountryListView.vue";
import ResearchAreaListView from "@/views/ResearchAreaListView.vue";
import DocumentClaimerView from "@/views/DocumentClaimerView.vue";
import PublisherPublicationsComparator from "@/views/comparators/publisher/PublisherPublicationsComparator.vue";
import PublisherMetadataComparator from "@/views/comparators/publisher/PublisherMetadataComparator.vue";
import IndicatorsListView from "@/views/assessment/listViews/IndicatorsListView.vue";
import AssessmentRulebooksView from "@/views/assessment/listViews/AssessmentRulebooksView.vue";
import AssessmentRulebookLandingView from "@/views/assessment/landingPages/AssessmentRulebookLandingView.vue";
import CommissionsView from "@/views/assessment/listViews/CommissionsView.vue";
import CommissionLandingView from "@/views/assessment/landingPages/CommissionLandingView.vue";
import LanguageTagListView from "@/views/LanguageTagListView.vue";
import ScheduledTasksView from "@/views/ScheduledTasksView.vue";
import AssessmentClassificationsListView from "@/views/assessment/listViews/AssessmentClassificationsListView.vue";
import ReportsView from "@/views/reporting/ReportsView.vue";
import BrandingInformationView from "@/views/BrandingInformationView.vue";
import MassInstitutionAssignmentView from "@/views/MassInstitutionAssignmentView.vue";
import ApiKeysManagementView from "@/views/ApiKeysManagementView.vue";
import MServiceView from "@/views/MServiceView.vue";
import ThesisLibraryReportView from "@/views/thesisLibrary/ThesisLibraryReportView.vue";
import ThesisLibrarySearchView from "@/views/thesisLibrary/ThesisLibrarySearchView.vue";
import PromotionListView from "@/views/thesisLibrary/PromotionListView.vue";
import RegistryBookView from "@/views/thesisLibrary/RegistryBookView.vue";
import RegistryBookEntryLanding from "@/views/thesisLibrary/RegistryBookEntryLanding.vue";
import CancelAttendanceView from "@/views/thesisLibrary/CancelAttendanceView.vue";
import HealthStatus from "@/views/HealthStatus.vue";
import ThesisLibraryBackupView from "@/views/thesisLibrary/ThesisLibraryBackupView.vue";
import DocumentBackupView from "@/views/DocumentBackupView.vue";
import LegacyRedirectView from "@/views/LegacyRedirectView.vue";
import NotFound from "@/views/NotFound.vue";
import EmailUpdateConfirmationView from "@/views/EmailUpdateConfirmationView.vue";
import FeedbackForm from "@/components/core/FeedbackForm.vue";
import PublicReviewDissertationsView from "@/views/thesisLibrary/PublicReviewDissertationsView.vue";
import PublicationsValidationView from "@/views/PublicationsValidationView.vue";
import OAuth2Redirector from "@/components/user/oauth2/OAuth2Redirector.vue";
import AuthorReprintPublicationsView from "@/views/AuthorReprintPublicationsView.vue";


const roles = {
    researcher: "RESEARCHER",
    admin: "ADMIN",
    institutionalEditor: "INSTITUTIONAL_EDITOR",
    commission: "COMMISSION",
    viceDeanForScience: "VICE_DEAN_FOR_SCIENCE",
    institutionalLibrarian: "INSTITUTIONAL_LIBRARIAN",
    headOfLibrary: "HEAD_OF_LIBRARY",
    promotionRegistryAdministrator: "PROMOTION_REGISTRY_ADMINISTRATOR"
};


const router = createRouter({
    scrollBehavior(_to, _from, _savedPosition) {
        return { top: 0 };
    },
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "base",
            redirect: { name: 'home', params: { locale: defaultLocale } },
        },
        {
            path: "/record.jsf",
            name: "legacyEntityRedirect",
            component: LegacyRedirectView,
            meta: {
                authenticated: false,
                authorities: [],
            },
        },
        {
            path: "/DownloadFileServlet/:fileName",
            name: "legacyFileRedirect",
            component: LegacyRedirectView,
            meta: {
                authenticated: false,
                authorities: [],
            },
        },
        {
            path: "/:locale",
            name: "baseLocale",
            children: [
                {
                    path: "",
                    name: "home",
                    component: HomeView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "contact",
                    name: "contact",
                    component: FeedbackForm,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "not-found",
                    name: "notFound",
                    component: NotFound,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "login",
                    name: "login",
                    component: LoginView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                    props: true,
                },
                {
                    path: "oauth2",
                    name: "oauth2",
                    component: OAuth2Redirector,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                    props: true,
                },
                {
                    path: "register",
                    name: "register",
                    component: RegisterView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "user-profile",
                    name: "userProfile",
                    component: UserProfileView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher, roles.commission, roles.viceDeanForScience, roles.institutionalLibrarian, roles.headOfLibrary, roles.promotionRegistryAdministrator],
                    },
                },
                {
                    path: "users",
                    name: "users",
                    component: UserListView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "events",
                    name: "eventsParent",
                    children: [
                        {
                            path: "",
                            name: "events",
                            component: EventListView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.commission],
                            },
                        },
                        {
                            path: "conference/:id",
                            name: "conferenceLandingPage",
                            component: ConferenceLandingView,
                            meta: {
                                authenticated: false,
                                authorities: [],
                            },
                        },
                        {
                            path: 'proceedings-comparator/:leftId/:rightId',
                            name: "eventProceedingsComparator",
                            component: EventProceedingsComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: 'metadata-comparator/:leftId/:rightId',
                            name: "eventMetadataComparator",
                            component: EventMetadataComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                    ]
                },
                {
                    path: "submit-conference",
                    name: "submitConference",
                    component: SubmitConferenceView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                    },
                },
                {
                    path: "submit-publisher",
                    name: "submitPublisher",
                    component: SubmitPublisherView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                    },
                },
                {
                    path: "submit-person",
                    name: "submitPerson",
                    component: SubmitPersonView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor],
                    },
                },
                {
                    path: "submit-organisation-unit",
                    name: "submitOrganisationUnit",
                    component: SubmitOrganisationUnitView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "book-series",
                    name: "bookSeriesParent",
                    children: [
                        {
                            path: "",
                            name: "bookSeries",
                            component: BookSeriesListView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: ":id",
                            name: "bookSeriesLandingPage",
                            component: BookSeriesLandingView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.researcher, roles.institutionalEditor, roles.viceDeanForScience, roles.institutionalLibrarian, roles.headOfLibrary, roles.promotionRegistryAdministrator],
                            },
                        },
                        {
                            path: 'publications-comparator/:leftId/:rightId',
                            name: "bookSeriesPublicationsComparator",
                            component: BookSeriesPublicationsComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: 'metadata-comparator/:leftId/:rightId',
                            name: "bookSeriesMetadataComparator",
                            component: BookSeriesMetadataComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                    ]
                },
                {
                    path: "submit-book-series",
                    name: "submitBookSeries",
                    component: SubmitBookSeriesView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "journals",
                    name: "journalsParent",
                    children: [
                        {
                            path: "",
                            name: "journals",
                            component: JournalListView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.commission],
                            },
                        },
                        {
                            path: ":id",
                            name: "journalLandingPage",
                            component: JournalLandingView,
                            meta: {
                                authenticated: false,
                                authorities: [],
                            },
                        },
                        {
                            path: 'publications-comparator/:leftId/:rightId',
                            name: "journalPublicationsComparator",
                            component: JournalPublicationsComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: 'metadata-comparator/:leftId/:rightId',
                            name: "journalMetadataComparator",
                            component: JournalMetadataComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                    ]
                },
                {
                    path: "submit-journal",
                    name: "submitJournal",
                    component: SubmitJournalView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                    },
                },
                {
                    path: "publishers",
                    name: "publishersParent",
                    children: [
                        {
                            path: "",
                            name: "publishers",
                            component: PublisherListView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: ":id",
                            name: "publisherLandingPage",
                            component: PublisherLandingView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.researcher, roles.institutionalEditor, roles.viceDeanForScience, roles.institutionalLibrarian, roles.headOfLibrary, roles.promotionRegistryAdministrator],
                            },
                        },
                        {
                            path: 'publications-comparator/:leftId/:rightId',
                            name: "publisherPublicationsComparator",
                            component: PublisherPublicationsComparator,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: 'metadata-comparator/:leftId/:rightId',
                            name: "publisherMetadataComparator",
                            component: PublisherMetadataComparator,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                    ]
                },
                {
                    path: "persons",
                    name: "personsParent",                  
                    children: [
                        {
                            path: "",
                            name: "persons",
                            component: PersonListView,
                            meta: {
                                authenticated: false,
                                authorities: [],
                            },
                        },
                        {
                            path: ":id",
                            name: "researcherLandingPage",
                            component: ResearcherLandingView,
                            meta: {
                                authenticated: false,
                                authorities: [],
                            },
                        },
                        {
                            path: 'publications-comparator/:leftId/:rightId',
                            name: "personPublicationsComparator",
                            component: PersonPublicationsComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.institutionalEditor],
                            },
                        },
                        {
                            path: 'metadata-comparator/:leftId/:rightId',
                            name: "personMetadataComparator",
                            component: PersonMetadataComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.institutionalEditor],
                            },
                        },
                    ]
                },
                {
                    path: "organisation-units",
                    name: "organisationUnitsParent",
                    children: [
                        {
                            path: "",
                            name: "organisationUnits",
                            component: OrganisationUnitListView,
                            meta: {
                                authenticated: false,
                                authorities: [],
                            },
                        },
                        {
                            path: ":id",
                            name: "organisationUnitLandingPage",
                            component: OrgUnitLandingView,
                            meta: {
                                authenticated: false,
                                authorities: [],
                            },
                        },
                        {
                            path: 'employments-comparator/:leftId/:rightId',
                            name: "organisationUnitEmploymentsComparator",
                            component: OrganisationUnitEmployeeComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.institutionalEditor],
                            },
                        },
                        {
                            path: 'metadata-comparator/:leftId/:rightId',
                            name: "organisationUnitMetadataComparator",
                            component: OrganisationUnitMetadataComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.institutionalEditor],
                            },
                        },
                    ]
                },
                {
                    path: "scientific-results",
                    name: "scientificResultsParent",
                    children: [
                        {
                            path: "",
                            name: "scientificResults",
                            component: ScientificResultsView,
                            meta: {
                                authenticated: false,
                                authorities: [],
                            },
                        },
                        {
                            path: "author-reprints",
                            name: "authorReprints",
                            component: AuthorReprintPublicationsView,
                            meta: {
                                authenticated: false,
                                authorities: [],
                            },
                        },
                        {
                            path: "validation",
                            name: "publicationsValidation",
                            component: PublicationsValidationView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.institutionalEditor],
                            },
                        },
                        {
                            path: "journal-publication",
                            children: [
                                {
                                    path: ":id",
                                    name: "journalPublicationLandingPage",
                                    component: JournalPublicationLandingView,
                                    meta: {
                                        authenticated: false,
                                        authorities: [],
                                    },
                                },
                                {
                                    path: "submit-journal-publication",
                                    name: "submitJournalPublication",
                                    component: SubmitJournalPublicationView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                                    },
                                },
                                {
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "journalPublicationMetadataComparator",
                                    component: JournalPublicationMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor],
                                    },
                                },
                            ]
                        },
                        {
                            path: "proceedings-publication",
                            children: [
                                {
                                    path: ":id",
                                    name: "proceedingsPublicationLandingPage",
                                    component: ProceedingsPublicationsLandingView,
                                    meta: {
                                        authenticated: false,
                                        authorities: [],
                                    },
                                },
                                {
                                    path: "submit-proceedings-publication",
                                    name: "submitProceedingsPublication",
                                    component: SubmitProceedingsPublicationView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                                    },
                                },
                                {
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "proceedingsPublicationMetadataComparator",
                                    component: ProceedingsPublicationComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor],
                                    },
                                },
                            ]
                        },
                        {
                            path: "software",
                            children: [
                                {
                                    path: ":id",
                                    name: "softwareLandingPage",
                                    component: SoftwareLandingView,
                                    meta: {
                                        authenticated: false,
                                        authorities: [],
                                    },
                                },
                                {
                                    path: "submit-software",
                                    name: "submitSoftware",
                                    component: SubmitSoftwareView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                                    },
                                },
                                {
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "softwareMetadataComparator",
                                    component: SoftwareMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor],
                                    },
                                },
                            ]
                        },
                        {
                            path: "dataset",
                            children: [
                                {
                                    path: ":id",
                                    name: "datasetLandingPage",
                                    component: DatasetLandingView,
                                    meta: {
                                        authenticated: false,
                                        authorities: [],
                                    },
                                },
                                {
                                    path: "submit-dataset",
                                    name: "submitDataset",
                                    component: SubmitDatasetView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                                    },
                                },
                                {
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "datasetMetadataComparator",
                                    component: DatasetMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor],
                                    },
                                },
                            ]
                        },
                        {
                            path: "patent",
                            children: [
                                {
                                    path: ":id",
                                    name: "patentLandingPage",
                                    component: PatentLandingView,
                                    meta: {
                                        authenticated: false,
                                        authorities: [],
                                    },
                                },
                                {
                                    path: "submit-patent",
                                    name: "submitPatent",
                                    component: SubmitPatentView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                                    },
                                },
                                {
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "patentMetadataComparator",
                                    component: PatentMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor],
                                    },
                                },
                            ]
                        },
                        {
                            path: "monograph",
                            children: [
                                {
                                    path: ":id",
                                    name: "monographLandingPage",
                                    component: MonographLandingView,
                                    meta: {
                                        authenticated: false,
                                        authorities: [],
                                    },
                                },
                                {
                                    path: "submit-monograph",
                                    name: "submitMonograph",
                                    component: SubmitMonographView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                                    },
                                },
                                {
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "monographMetadataComparator",
                                    component: MonographMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor],
                                    },
                                },
                                {
                                    path: 'publications-comparator/:leftId/:rightId',
                                    name: "monographPublicationsComparator",
                                    component: MonographPublicationsComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
                                    },
                                },
                            ]
                        },
                        {
                            path: "monograph-publication",
                            children: [
                                {
                                    path: ":id",
                                    name: "monographPublicationLandingPage",
                                    component: MonographPublicationLandingView,
                                    meta: {
                                        authenticated: false,
                                        authorities: [],
                                    },
                                },
                                {
                                    path: "submit-monograph-publication",
                                    name: "submitMonographPublication",
                                    component: SubmitMonographPublicationView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                                    },
                                },
                                {
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "monographPublicationMetadataComparator",
                                    component: MonographPublicationMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor],
                                    },
                                },
                            ]
                        },
                        {
                            path: "thesis",
                            children: [
                                {
                                    path: ":id",
                                    name: "thesisLandingPage",
                                    component: ThesisLandingView,
                                    meta: {
                                        authenticated: false,
                                        authorities: [],
                                    },
                                },
                                {
                                    path: "submit-thesis",
                                    name: "submitThesis",
                                    component: SubmitThesisView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher, roles.institutionalLibrarian],
                                    },
                                },
                                {
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "thesisMetadataComparator",
                                    component: ThesisMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.institutionalEditor],
                                    },
                                },
                            ]
                        }
                    ]
                    
                },
                {
                    path: "proceedings",         
                    children: [
                        {
                            path: ":id",
                            name: "proceedingsLandingPage",
                            component: ProceedingsLandingView,
                            meta: {
                                authenticated: false,
                                authorities: [],
                            },
                        },
                        {
                            path: "submit-proceedings",
                            name: "submitProceedings",
                            component: SubmitProceedingsView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                            },
                        },
                        {
                            path: 'publications-comparator/:leftId/:rightId',
                            name: "proceedingsPublicationsComparator",
                            component: ProceedingsPublicationsComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: 'metadata-comparator/:leftId/:rightId',
                            name: "proceedingsMetadataComparator",
                            component: ProceedingsMetadataComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                    ]
                },
                {
                    path: "advanced-search",
                    name: "advancedSearch",
                    component: AdvancedSearchView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "activate-account/:activationToken",
                    name: "activateAccount",
                    component: AccountActivationView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "update-email/:confirmationToken",
                    name: "emailChangeConfirmation",
                    component: EmailUpdateConfirmationView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "importer",
                    name: "importer",
                    component: HarvesterView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.researcher, roles.admin, roles.institutionalEditor],
                    },
                },
                {
                    path: "loader",
                    name: "loader",
                    component: LoaderView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.researcher, roles.admin, roles.institutionalEditor],
                    },
                },
                {
                    path: "reset-password/:resetToken",
                    name: "resetPassword",
                    component: ResetPasswordView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: 'contact',
                    component: ExternalRedirect,
                    props: {
                      url: 'http://dosird.uns.ac.rs/contact',
                    },
                },
                {
                    path: "notifications",
                    name: "notifications",
                    component: NotificationsView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.researcher, roles.institutionalEditor, roles.admin, roles.viceDeanForScience, roles.institutionalLibrarian, roles.headOfLibrary, roles.commission, roles.promotionRegistryAdministrator],
                    },
                },
                {
                    path: "deduplication",
                    name: "deduplication",
                    component: DeduplicationView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "countries",
                    name: "countries",
                    component: CountryListView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "language-tags",
                    name: "languageTags",
                    component: LanguageTagListView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "research-areas",
                    name: "researchAreas",
                    component: ResearchAreaListView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "document-claim",
                    name: "documentClaim",
                    component: DocumentClaimerView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.researcher],
                    },
                },
                {
                    path: "scheduled-tasks",
                    name: "scheduledTasks",
                    component: ScheduledTasksView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "branding",
                    name: "branding",
                    component: BrandingInformationView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "mass-institution-assignment",
                    name: "massInstitutionAssignment",
                    component: MassInstitutionAssignmentView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.researcher],
                    },
                },
                {
                    path: "api-key-management",
                    name: "apiKeyManagement",
                    component: ApiKeysManagementView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "assessment",                 
                    children: [
                        {
                            path: "indicators",
                            name: "indicators",
                            component: IndicatorsListView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: "classifications",
                            name: "classifications",
                            component: AssessmentClassificationsListView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: "assessment-rulebooks",
                            name: "assessmentRulebooksParent",
                            children: [
                                {
                                    path: "",
                                    name: "assessmentRulebooks",
                                    component: AssessmentRulebooksView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
                                    },
                                },
                                {
                                    path: ":id",
                                    name: "assessmentRulebookLandingPage",
                                    component: AssessmentRulebookLandingView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
                                    },
                                },
                            ]
                        },
                        {
                            path: "commissions",
                            name: "commissionsParent",
                            children: [
                                {
                                    path: "",
                                    name: "commissions",
                                    component: CommissionsView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
                                    },
                                },
                                {
                                    path: ":id",
                                    name: "commissionLandingPage",
                                    component: CommissionLandingView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin, roles.commission],
                                    },
                                },
                            ]
                        },
                        {
                            path: "reporting",
                            name: "reporting",
                            component: ReportsView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.viceDeanForScience],
                            },
                        },
                        {
                            path: "m-service",
                            name: "mService",
                            component: MServiceView,
                            meta: {
                                authenticated: false,
                                authorities: [],
                            },
                        },
                    ]
                },
                {
                    path: "thesis-library-reporting",
                    name: "thesisLibraryReporting",
                    component: ThesisLibraryReportView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.headOfLibrary, roles.admin],
                    },
                },
                {
                    path: "thesis-library-search",
                    name: "thesisLibrarySearch",
                    component: ThesisLibrarySearchView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "thesis-library-backup",
                    name: "thesisLibraryBackup",
                    component: ThesisLibraryBackupView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalLibrarian, roles.headOfLibrary],
                    },
                },
                {
                    path: "thesis-library/public-dissertations",
                    name: "publicDissertationsReport",
                    component: PublicReviewDissertationsView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "document-backup",
                    name: "documentBackup",
                    component: DocumentBackupView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor],
                    },
                },
                {
                    path: "promotions",
                    name: "promotions",
                    component: PromotionListView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.promotionRegistryAdministrator],
                    },
                },
                {
                    path: "cancel-attendance/:attendanceIdentifier",
                    name: "cancelAttendance",
                    component: CancelAttendanceView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "registry-book",
                    name: "registryBookListParent",
                    children: [
                        {
                            path: "",
                            name: "registryBookList",
                            component: RegistryBookView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.promotionRegistryAdministrator],
                            },
                        },
                        {
                            path: ":id",
                            name: "registryBookLandingPage",
                            component: RegistryBookEntryLanding,
                            meta: {
                                authenticated: false,
                                authorities: [roles.admin, roles.promotionRegistryAdministrator, roles.institutionalLibrarian],
                            },
                        },
                    ]
                },
                {
                    path: "health-check",
                    name: "healthCheck",
                    component: HealthStatus,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                }
            ]
        },
    ],
});

export default router;
