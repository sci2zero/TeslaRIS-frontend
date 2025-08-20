import { useHead } from '@vueuse/head'
import { type AxiosResponseHeaders } from 'axios';


export const injectFairSignposting = (headers: AxiosResponseHeaders) => {
    if (!headers) {
        return;
    }

    const rawLinkHeader = headers['link'] ?? headers['Link'];

    const linkHeaders: string[] = Array.isArray(rawLinkHeader)
        ? rawLinkHeader
        : rawLinkHeader
        ? [String(rawLinkHeader)]
        : [];

    if (linkHeaders.length === 0) {
        return;
    }

    const links = linkHeaders.flatMap((linkHeader) => {
        return linkHeader.split(',').map((part) => {
            const matchWithType = part.match(/<([^>]+)>\s*;\s*rel="([^"]+)";\s*type="([^"]+)"/);
            const matchWithoutType = part.match(/<([^>]+)>\s*;\s*rel="([^"]+)"/);
            if (!matchWithType && !matchWithoutType) {
                return null;
            }

            
            if (matchWithType) {
                const [, href, rel, type] = matchWithType;
                return { rel, href, type };
            } else if (matchWithoutType) {
                const [, href, rel] = matchWithoutType;
                return { rel, href };
            }
            
            return null;
        }).filter(Boolean);
    });

    if (links.length === 0) {
        return;
    }

    useHead({
        link: [
            {
                rel: "type",
                href: "https://schema.org/AboutPage"
            }
        ]
    });
    
    links.forEach(link => {
        if (!link) {
            return;
        }
        
        useHead({
            link: [
                {
                    rel: link.rel,
                    href: link.href,
                    ...(link.type ? { type: link.type } : {})
                }
            ]
        });
    });
};
