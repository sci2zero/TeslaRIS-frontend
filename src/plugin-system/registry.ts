import { markRaw, reactive, shallowReactive, type Component } from "vue";
import type { RouteRecordRaw } from "vue-router";
import i18n, { configureLocales } from "@/i18n";
import router from "@/router";
import type { ExtensionContribution, ExtensionInput, FrontendPlugin, PluginRoute } from "./types";

const overrides = shallowReactive(new Map<string, Component>());
const extensions = shallowReactive(new Map<string, Map<string, ExtensionContribution>>());
const pluginRoutes = shallowReactive(new Map<string, PluginRoute>());
const config = reactive<Record<string, unknown>>({});
const constants = reactive<Record<string, unknown>>({});

export function registerPlugin(plugin: FrontendPlugin) {
    if (plugin.overrides) {
        for (const [name, component] of Object.entries(plugin.overrides)) {
            overrides.set(name, markRaw(component));
        }
    }

    if (plugin.extensions) {
        for (const [point, contributions] of Object.entries(plugin.extensions)) {
            if (!extensions.has(point)) {
                extensions.set(point, shallowReactive(new Map<string, ExtensionContribution>()));
            }

            const pointExtensions = extensions.get(point);
            if (!pointExtensions) {
                continue;
            }

            contributions.forEach((input, index) => {
                const contribution = normalizeContribution(input, plugin.id, point, index);
                pointExtensions.set(contribution.id, contribution);
            });
        }
    }

    if (plugin.i18n) {
        for (const [locale, messages] of Object.entries(plugin.i18n)) {
            i18n.vueI18n.global.mergeLocaleMessage(locale, messages as never);
        }
    }

    if (plugin.config) {
        deepMerge(config, plugin.config);
        applyLocaleConfig(plugin.config);
    }

    if (plugin.constants) {
        deepMerge(constants, plugin.constants);
    }

    if (plugin.routes) {
        for (const route of plugin.routes) {
            registerRoute(route);
        }
    }
}

export function getOverride(name: string): Component | undefined {
    return overrides.get(name);
}

export function getExtensions<T extends ExtensionContribution = ExtensionContribution>(
    point: string
): T[] {
    const pointExtensions = extensions.get(point);

    if (!pointExtensions) {
        return [];
    }

    return Array.from(pointExtensions.values())
        .slice()
        .sort((left, right) => (left.order ?? 0) - (right.order ?? 0)) as T[];
}

export function getRoutes(): PluginRoute[] {
    return Array.from(pluginRoutes.values())
        .slice()
        .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

export function getConfig(): Record<string, unknown> {
    return config;
}

export function getConstants(): Record<string, unknown> {
    return constants;
}

function registerRoute(route: PluginRoute) {
    if (router.hasRoute(route.name)) {
        router.removeRoute(route.name);
    }

    const wrappedRoute = {
        ...route,
        component: markRaw(route.component),
    };

    router.addRoute(toRouteRecord(wrappedRoute));
    pluginRoutes.set(wrappedRoute.name, wrappedRoute);
}

function toRouteRecord(route: PluginRoute): RouteRecordRaw {
    return {
        name: route.name,
        path: route.path,
        component: route.component,
        meta: {
            ...route.meta,
            titleKey: route.titleKey,
            order: route.order,
        },
    };
}

function normalizeContribution(
    input: ExtensionInput,
    pluginId: string,
    point: string,
    index: number
): ExtensionContribution {
    if (isComponentShorthand(input)) {
        return {
            id: `${pluginId}:${point}:${index}`,
            component: markRaw(input),
        };
    }

    return {
        ...input,
        id: input.id ?? `${pluginId}:${point}:${index}`,
        component: input.component ? markRaw(input.component) : input.component,
    };
}

function isComponentShorthand(value: ExtensionInput): value is Component {
    if (typeof value === "function") {
        return true;
    }

    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
        typeof candidate.setup === "function" ||
        typeof candidate.render === "function" ||
        typeof candidate.template === "string"
    );
}

function applyLocaleConfig(source: Record<string, unknown>) {
    const defaultLocale = source.defaultLocale;
    const supportedLocales = source.supportedLocales;

    if (typeof defaultLocale !== "string" && !Array.isArray(supportedLocales)) {
        return;
    }

    configureLocales({
        defaultLocale: typeof defaultLocale === "string" ? defaultLocale : undefined,
        supportedLocales: Array.isArray(supportedLocales)
            ? supportedLocales.filter((locale): locale is string => typeof locale === "string")
            : undefined,
    });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
    for (const [key, value] of Object.entries(source)) {
        const existing = target[key];

        if (isPlainObject(existing) && isPlainObject(value)) {
            deepMerge(existing, value);
        } else if (isPlainObject(value)) {
            target[key] = deepMerge({}, value);
        } else {
            target[key] = value;
        }
    }

    return target;
}
