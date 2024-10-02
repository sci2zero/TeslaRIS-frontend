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


const roles = { researcher: "RESEARCHER", admin: "ADMIN", institutionalEditor: "INSTITUTIONAL_EDITOR" };


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "base",
            redirect: { name: 'home', params: { locale: defaultLocale } },
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
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
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
                    children: [
                        {
                            path: "",
                            name: "events",
                            component: EventListView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: "conference/:id",
                            name: "conferenceLandingPage",
                            component: ConferenceLandingView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin, roles.researcher, roles.institutionalEditor],
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
                                authorities: [roles.admin, roles.researcher, roles.institutionalEditor],
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
                    children: [
                        {
                            path: "",
                            name: "journals",
                            component: JournalListView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
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
                    path: "submit-journal-publication",
                    name: "submitJournalPublication",
                    component: SubmitJournalPublicationView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
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
                    path: "submit-software",
                    name: "submitSoftware",
                    component: SubmitSoftwareView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                    },
                },
                {
                    path: "submit-thesis",
                    name: "submitThesis",
                    component: SubmitThesisView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
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
                    path: "submit-monograph-publication",
                    name: "submitMonographPublication",
                    component: SubmitMonographPublicationView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
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
                    path: "publishers",                    
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
                                authorities: [roles.admin, roles.researcher, roles.institutionalEditor],
                            },
                        }
                    ]
                },
                {
                    path: "persons",                    
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
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: 'metadata-comparator/:leftId/:rightId',
                            name: "personMetadataComparator",
                            component: PersonMetadataComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                    ]
                },
                {
                    path: "organisation-units",                 
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
                                authorities: [roles.admin],
                            },
                        },
                        {
                            path: 'metadata-comparator/:leftId/:rightId',
                            name: "organisationUnitMetadataComparator",
                            component: OrganisationUnitMetadataComparatorView,
                            meta: {
                                authenticated: true,
                                authorities: [roles.admin],
                            },
                        },
                    ]
                    
                },
                {
                    path: "scientific-results",                
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
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "journalPublicationMetadataComparator",
                                    component: JournalPublicationMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
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
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "proceedingsPublicationMetadataComparator",
                                    component: ProceedingsPublicationComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
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
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "softwareMetadataComparator",
                                    component: SoftwareMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
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
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "datasetMetadataComparator",
                                    component: DatasetMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
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
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "patentMetadataComparator",
                                    component: PatentMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
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
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "monographMetadataComparator",
                                    component: MonographMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
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
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "monographPublicationMetadataComparator",
                                    component: MonographPublicationMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
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
                                    path: 'metadata-comparator/:leftId/:rightId',
                                    name: "thesisMetadataComparator",
                                    component: ThesisMetadataComparatorView,
                                    meta: {
                                        authenticated: true,
                                        authorities: [roles.admin],
                                    },
                                },
                            ]
                        }
                    ]
                    
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
                    path: "submit-proceedings-publication",
                    name: "submitProceedingsPublication",
                    component: SubmitProceedingsPublicationView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                    },
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
                    path: "importer",
                    name: "importer",
                    component: HarvesterView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.researcher],
                    },
                },
                {
                    path: "loader",
                    name: "loader",
                    component: LoaderView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.researcher],
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
                        authorities: [roles.researcher, roles.institutionalEditor, roles.admin],
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
            ]
        },
    ],
});

export default router;
