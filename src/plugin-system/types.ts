import type { Component } from "vue";

export interface ExtensionContribution {
    id: string;
    order?: number;
    component?: Component;
    titleKey?: string;
    permission?: string;
    data?: unknown;
}

export type ExtensionInput = Component | (Omit<ExtensionContribution, "id"> & { id?: string });

export interface PluginRoute {
    name: string;
    path: string;
    component: Component;
    titleKey?: string;
    order?: number;
    meta?: Record<string, unknown>;
}

export interface FrontendPlugin {
    id: string;
    overrides?: Record<string, Component>;
    extensions?: Record<string, ExtensionInput[]>;
    i18n?: Record<string, unknown>;
    config?: Record<string, unknown>;
    constants?: Record<string, unknown>;
    routes?: PluginRoute[];
}
