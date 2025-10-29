export function generateGatewayUrlById(mappingId: string): string {
    const baseUrl = process.env.GATEWAY_BASE || 'http://localhost:3001';
    return `${baseUrl}/proxy/${mappingId}`;
}

export function parseMappingIdFromUrl(url: string): string | null {
    const match = url.match(/\/proxy\/([a-f0-9-]{36})/);
    return match ? match[1] : null;
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
