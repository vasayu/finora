export function normalizeDomain(domain: string): string {
    return domain
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
        .toLowerCase();
}

export async function getCompanyInsights(domain: string) {
    return {
        summary: null,
        news: [],
        financialSignals: []
    };
}
