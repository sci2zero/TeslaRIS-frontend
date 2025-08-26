import { useHead } from '@vueuse/head'
import { type AxiosResponseHeaders } from 'axios';


let signpostingCount = 0;

export const injectFairSignposting = (headers: AxiosResponseHeaders) => {
    if (!headers) {
        return;
    }

    cleanupFairSignposting();
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

    signpostingCount++;

    useHead({
        link: [
            {
                rel: "type",
                href: "https://schema.org/AboutPage",
                key: `signposting-type-${signpostingCount}`
            }
        ]
    });
    
    links.forEach((link, index) => {
        if (!link) {
            return;
        }
        
        useHead({
            link: [
                {
                    rel: link.rel,
                    href: link.href,
                    ...(link.type ? { type: link.type } : {}),
                    // Add unique key to force re-render
                    key: `signposting-${index}-${signpostingCount}`
                }
            ]
        });
    });
};

const cleanupFairSignposting = () => {
    const currentLinks = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link'));
    const filteredLinks = currentLinks
        .filter(link =>
            !link.rel ||
            (link.rel !== 'type' &&
            !link.rel.includes('describedby') &&
            !link.rel.includes('item') &&
            !link.rel.includes('collection') &&
            !link.rel.includes('license') &&
            !link.rel.includes('cite-as'))
        )
        .map(link => ({
            rel: link.rel,
            href: link.href,
            type: link.type || undefined,
        }));

    document.querySelectorAll<HTMLLinkElement>('head link').forEach(link => link.remove());
    useHead({
        link: filteredLinks,
    });
};
