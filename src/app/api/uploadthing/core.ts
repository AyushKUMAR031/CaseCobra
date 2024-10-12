import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
//z is add for runtime validation
const f = createUploadthing();

// FileRouter for app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Defining multiple FileRoutes, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
  
  .input(z.object({configId: z.string().optional()})) // <-- z used here
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      return { input }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON the server
        // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      const {configId} = metadata.input;
      return { configId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
