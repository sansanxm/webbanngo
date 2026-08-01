export function stripHtml(html: string) {
    if (!html) return "";

    // Replace block tags with newline to preserve structure
    let text = html
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n');

    // Strip all tags
    text = text.replace(/<[^>]*>?/gm, '');

    // Decode entities
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    return text.trim();
}

export function sanitizeContent(html: string) {
    if (!html) return "";

    // We want to preserve [img:...] and basic formatting <b>, <i>, <u>, <br>, <p>
    // But we want to strip scripts and potentially malicious tags.
    // Since this is an admin tool, we can be slightly lenient, 
    // but a regex strip of <script> is a good baseline.

    // 1. Remove scripts
    let text = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");

    // 2. We don't need to strip <b>, <i> because we WANT them.
    // However, we should decoding entities if we want to ensure [img:...] is clean?
    // Actually, if we use dangerouslySetInnerHTML, we usually expect HTML.
    // But our input (from textarea) might contain literal &lt;b&gt; if we are not careful?
    // No, textarea output is plain text. If we insert "<b>text</b>", it is string "<b>text</b>".
    // dangerouslySetInnerHTML will interpret string "<b>" as tag <b>. Correct.

    // But if we use stripHtml's entity decoding, it might break things if not careful.
    // Let's just return the text with script stripped.
    // And maybe handle block conversions if it was legacy data?
    // Legacy data had <p>...</p>.
    // If we want legacy data to break lines, we should keep <p> or convert to <br>.
    // Let's just keep <p> tags too!

    return text;
}
