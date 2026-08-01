"use server";

import { uploadFile } from "@/lib/drive";

export async function uploadDocument(formData: FormData) {
    const file = formData.get("file") as File;
    // Use env var for folder ID, fallback to root if not set (though highly recommended to set it)
    const folderId = process.env.DRIVE_FOLDER_ID;
    const fileName = file.name;

    if (!file) return { success: false, error: "No file provided" };
    if (!folderId) return { success: false, error: "DRIVE_FOLDER_ID not configured in environment" };

    try {
        const result = await uploadFile(file, folderId, fileName);
        // Convert result to plain object to ensure serialization
        return {
            success: true,
            data: {
                id: result.id,
                name: result.name,
                webViewLink: result.webViewLink,
                thumbnailLink: result.thumbnailLink
            }
        };
    } catch (error: any) {
        console.error("Upload failed:", error);
        return { success: false, error: error.message || "Upload failed" };
    }
}
