import { pluginLoaders } from "virtual:teslaris-plugins";
import type { FrontendPlugin } from "./types";

export type AvailablePluginId = string;

export async function loadPlugin(id: AvailablePluginId): Promise<FrontendPlugin> {
    const load = pluginLoaders[id];

    if (!load) {
        throw new Error(`[plugins] Plugin "${id}" is not listed in plugins.local.json`);
    }

    return (await load()).default;
}
