import { pluginProfiles } from "virtual:teslaris-plugins";
import { corePlugin } from "./core";
import { loadPlugin } from "./plugins";
import { registerPlugin } from "./registry";

export type PluginProfileName = string;

export function resolvePluginProfile(
    name = import.meta.env.VITE_PLUGIN_PROFILE
): PluginProfileName {
    if (name && name in pluginProfiles) {
        return name;
    }

    if (name) {
        console.warn(`[plugins] Unknown profile "${name}", falling back to "core"`);
    }

    return "core";
}

export async function registerProfilePlugins(profileName?: string) {
    const profile = resolvePluginProfile(profileName);

    registerPlugin(corePlugin);

    const pluginIds = [...(pluginProfiles[profile] ?? [])];
    const plugins = await Promise.all(pluginIds.map((pluginId) => loadPlugin(pluginId)));

    for (const plugin of plugins) {
        registerPlugin(plugin);
    }
}
