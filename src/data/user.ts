import { db } from "@/db";
import { user } from "@/db/schema";
import { getSession } from "@/lib/auth.functions";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { deleteObject, getPresignedDownloadUrl, getPresignedUploadUrl } from "@/lib/storage";

// 1. Get a secure URL for the client to upload the file directly to MinIO
export const getProfileUploadUrl = createServerFn({ method: "POST" })
  .validator((data: { fileName: string; contentType: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const extension = data.fileName.split('.').pop() || 'jpg';
    const objectName = `avatars/${session.user.id}/${Date.now()}.${extension}`;

    const uploadUrl = await getPresignedUploadUrl(objectName, data.contentType);

    return { uploadUrl, objectName };
  });

// 2. Update the user record in the DB with the objectName
// This is called AFTER the client successfully uploads to MinIO using the presigned URL
export const updateProfile = createServerFn({ method: "POST" })
  .validator((data: { name?: string; objectName?: string; phone?: string; address?: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Fetch old avatar to clean up
    const [oldUser] = await db
      .select({ image: user.image })
      .from(user)
      .where(eq(user.id, session.user.id));

    const updateData: { name?: string; image?: string; phone?: string; address?: string } = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.address) updateData.address = data.address;

    if (data.objectName) {
      updateData.image = data.objectName;

      // MinIO Cleanup: Only delete if the new image is different
      if (oldUser?.image && oldUser.image !== data.objectName) {
        await deleteObject(oldUser.image).catch((err: unknown) =>
          console.error("Failed to delete old avatar:", err)
        );
      }
    }

    const [updated] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, session.user.id))
      .returning();

    if (!updated) throw new Error("User not found");
    return updated;
  });

// 3. Get a temporary URL to view the avatar
export const getAvatarUrl = createServerFn({ method: "POST" })
  .validator((data: { objectName: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    return await getPresignedDownloadUrl(data.objectName);
  });



export const uploadProfileImage = createServerFn({ method: "POST" })
  .validator((data: FormData) => {
    const file = data.get("file") as File;
    if (!file) throw new Error("File is required");
    return { file };
  })
  .handler(async ({ data }) => {
    const { file } = data;
    const { uploadUrl, objectName } = await getProfileUploadUrl({
      data: { fileName: file.name, contentType: file.type },
    });

    await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    return await updateProfile({ data: { objectName } });
  });
