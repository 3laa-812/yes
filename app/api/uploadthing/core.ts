import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 6 } })
                         // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .middleware(async ({ req }) => {
      const session = await auth();
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user?.id };
                                          
    })
                                         // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .onUploadComplete(async ({ metadata, file }) => {

      return { uploadedBy: metadata.userId };
                          
    }),
  paymentProofUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
                         // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .middleware(async ({ req }) => {
      const session = await auth();
      return { userId: session?.user?.id || "guest" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Payment proof uploaded by:", metadata.userId, "URL:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
