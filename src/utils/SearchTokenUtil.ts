const decodeToken = (token: string): string => {
    try {
        return decodeURIComponent(token);
    } catch {
        return token;
    }
};

export const toTokenArray = (params: string): string[] => {
    if (!params) {
        return [];
    }

    return params
        .replaceAll("tokens=", "")
        .split("&")
        .filter(token => token)
        .map(decodeToken);
};

export const toTokenQuery = (tokens: string[]): string => {
    return tokens
        .map(token => `tokens=${encodeURIComponent(token)}`)
        .join("&");
};

export const decodeSearchTokens = (params: string): string => {
    if (!params) {
        return params;
    }

    return params
        .split("&")
        .map(part => part.startsWith("tokens=")
            ? `tokens=${decodeToken(part.substring("tokens=".length))}`
            : decodeToken(part))
        .join("&");
};
