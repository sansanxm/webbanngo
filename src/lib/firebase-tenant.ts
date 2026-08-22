import { collection, doc, CollectionReference, DocumentReference } from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_SCHOOL_ID } from "./school";

export function getTenantCollectionRef(schoolId: string, collectionName: string): CollectionReference {
    const currentSchool = schoolId || DEFAULT_SCHOOL_ID;
    if (currentSchool === DEFAULT_SCHOOL_ID) {
        // Main school uses top-level collection for 100% backward compatibility
        return collection(db, collectionName);
    }
    // New schools use nested path under schools/{schoolId}/{collectionName}
    return collection(db, "schools", currentSchool, collectionName);
}

export function getTenantDocRef(schoolId: string, collectionName: string, docId: string): DocumentReference {
    const currentSchool = schoolId || DEFAULT_SCHOOL_ID;
    if (currentSchool === DEFAULT_SCHOOL_ID) {
        return doc(db, collectionName, docId);
    }
    return doc(db, "schools", currentSchool, collectionName, docId);
}
