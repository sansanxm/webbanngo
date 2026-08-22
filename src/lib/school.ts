export interface SchoolConfig {
    id: string;
    name: string;
    subdomain: string;
    customDomain?: string;
    logo?: string;
    address?: string;
    email?: string;
    phone?: string;
    slogan?: string;
    mapUrl?: string;
    zaloQrUrl?: string;
}

export const DEFAULT_SCHOOL_ID = "thcs-banngo";

// Map hostname to school ID if custom domain / subdomain is used
export function getSchoolIdFromHost(hostname: string, searchParams?: URLSearchParams): string {
    // 1. Check query parameter override if present (e.g. ?school=thcs-tantrao)
    if (searchParams) {
        const schoolQuery = searchParams.get("school");
        if (schoolQuery) return schoolQuery;
    }

    if (!hostname) return DEFAULT_SCHOOL_ID;

    const cleanHost = hostname.toLowerCase().split(":")[0]; // strip port

    // Localhost or Vercel default domain fallback to main school
    if (
        cleanHost === "localhost" ||
        cleanHost === "127.0.0.1" ||
        cleanHost.includes("webbanngo.vercel.app") ||
        cleanHost.includes("thbanngopvs.web.app")
    ) {
        return DEFAULT_SCHOOL_ID;
    }

    // Subdomain check e.g. "tantrao.truonghoc.vn" -> "thcs-tantrao"
    const parts = cleanHost.split(".");
    if (parts.length >= 3) {
        const sub = parts[0];
        if (sub && sub !== "www" && sub !== "app") {
            return `school-${sub}`;
        }
    }

    return DEFAULT_SCHOOL_ID;
}
