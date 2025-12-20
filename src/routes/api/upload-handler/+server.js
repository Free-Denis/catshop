// src/routes/api/upload-handler/+server.js
import { handleUpload } from '@vercel/blob';

export async function POST({ request }) {
  const body = await request.json();
  return handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname /* clientPayload */) => {
      // Run any logic to authorize the uploader
      // pathname is the file path requested by the client (including the filename)
      // clientPayload is an arbitrary string (could be JSON) sent by the client
      return {
        // optional, defaults to /
        pathname,
        // optional, defaults to 1
        maximumSizeInBytes: 5 * 1024 * 1024, // 5MB
        // required
        tokenPayload: JSON.stringify({
          // optional, sent to your server on upload completion
          callbackUrl: new URL('/api/handle-upload-completed', new URL(request.url).origin).href,
        }),
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      // Get notified of client upload completion
      // ⚠️ This will not work on `localhost` websites,
      // Use ngrok or similar to get the full domain URLs

      console.log('blob upload completed', blob, tokenPayload);

      try {
        // Run any logic after the file upload completed
        // const { userId } = JSON.parse(tokenPayload);
        // await db.update({ avatar: blob.url, userId });
      } catch (error) {
        throw new Error('Could not update user');
      }
    },
  });
}
