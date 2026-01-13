import admin from "firebase-admin"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url";
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const serviceAccountPath = path.join(dirname,"secrete_key.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath,"utf-8"))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();
