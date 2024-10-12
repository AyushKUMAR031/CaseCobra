import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";

const f = createUploadthing();

// FileRouter for app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Defining multiple FileRoutes, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
  //z is for the runtime validation
  .input(z.object({configId: z.string().optional()}))
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
