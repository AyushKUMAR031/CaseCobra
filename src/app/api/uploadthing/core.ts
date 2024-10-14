import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
//z is add for runtime validation
import sharp from "sharp";
import { db } from "@/db";
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

      //image processing data part
      const res = await fetch(file.url);
      const buffer = await res.arrayBuffer();

      const imgMetadata = await sharp(buffer).metadata();
      const { width, height } = imgMetadata;

      if(!configId){
        //checking th db for data and storing if not config is there
        const configuration = await db.configuration.create({
          data: {
            imageUrl: file.url,
            height: height || 500,
            width: width || 500, 
          },
        })
        return { configId: configuration.id }
      }else{
        const updatedConfiguration = await db.configuration.update({
          where: {
            id: configId,
          },
          data: {
            croppedImageUrl: file.url,
          },
        })
        return { configId: updatedConfiguration.id }
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;