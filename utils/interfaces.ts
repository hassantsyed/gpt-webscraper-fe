export type Plan = "FREE" | "PRO";

export interface BaseUser {
    uid: string;
    email: string;
    plan: Plan
    subscriptionId: string | null;
    stripeCustomerId: string | null;
    monthlyScrapeCount: number;
};

export interface Scrape {
    id: string;
    url: string;
    created: number | null;
    status: string;
    fields: string | null;
    html_blob_id: string | null;
    result_id: string | null;
    retry_count: number;
    done: number | null;
};

export interface CreateScrapeInput {
    url: string;
    fields: string | null;
};