import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

export async function uploadFileToStorage(localFilePath: string, destinationPath: string): Promise<string> {
  const bucket = admin.storage().bucket();

  const metadata = {
    metadata: {
      firebaseStorageDownloadTokens: uuidv4(),
    },
    contentType: 'application/octet-stream',
    cacheControl: 'public, max-age=31536000',
  };

  await bucket.upload(localFilePath, {
    destination: destinationPath,
    metadata: metadata,
  });

  const file = bucket.file(destinationPath);
  const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destinationPath)}?alt=media&token=${metadata.metadata.firebaseStorageDownloadTokens}`;

  return downloadURL;
}
