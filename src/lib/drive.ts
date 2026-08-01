import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

const getDriveService = () => {
    // Priority: 1. Local JSON file, 2. Env Var
    const keyFile = "thbanngopvs-b3d6d77c2762.json";

    // We try to use credentials from Env var if possible, but for local dev the file is safer
    let authOptions: any = {
        scopes: SCOPES,
    };

    try {
        // Try to require the file to see if it exists
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const keyFileContent = require(`../../${keyFile}`);
        console.log("Using local key file for auth");
        authOptions.keyFile = keyFile;
    } catch (e) {
        const credentials = JSON.parse(
            process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || "{}"
        );
        // Fix: Replace literal \n with actual newlines if present
        if (credentials.private_key) {
            credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
        }
        authOptions.credentials = credentials;
    }

    const auth = new google.auth.GoogleAuth(authOptions);

    return google.drive({ version: "v3", auth });
};

export const listFiles = async (folderId: string) => {
    try {
        const drive = getDriveService();
        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: "files(id, name, webViewLink, thumbnailLink, mimeType)",
            orderBy: "createdTime desc",
        });
        return res.data.files || [];
    } catch (error) {
        console.error("Error listing files:", error);
        return [];
    }
};

export const uploadFile = async (
    file: File,
    folderId: string,
    fileName: string
) => {
    try {
        const drive = getDriveService();
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        const checkRes = await drive.files.list({
            q: `'${folderId}' in parents and name = '${fileName}' and trashed = false`,
        });

        if (checkRes.data.files && checkRes.data.files.length > 0) {
            console.log("File already exists, skipping upload.");
            return checkRes.data.files[0];
        }

        const res = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId],
            },
            media: {
                mimeType: file.type,
                body: stream,
            },
            fields: "id, name, webViewLink, thumbnailLink",
        });

        return res.data;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};
