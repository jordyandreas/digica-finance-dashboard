import { supabase } from "@/lib/supabase";

export type ProgramBannerKind = "registration" | "promo";

const BUCKET = "program-banners";

function extensionFromFile(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export async function uploadProgramBanner(
  programId: string,
  kind: ProgramBannerKind,
  file: File,
): Promise<{ url: string | null; error: Error | null }> {
  const ext = extensionFromFile(file);
  const path = `${programId}/${kind}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) {
    return { url: null, error: new Error(error.message) };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = data.publicUrl
    ? `${data.publicUrl}?t=${Date.now()}`
    : null;

  if (!publicUrl) {
    return { url: null, error: new Error("Failed to resolve public banner URL") };
  }

  return { url: publicUrl, error: null };
}

export async function removeProgramBannerObjects(
  programId: string,
  kind: ProgramBannerKind,
): Promise<{ error: Error | null }> {
  const { data: listed, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(programId);

  if (listError) {
    return { error: new Error(listError.message) };
  }

  const targets = (listed ?? [])
    .filter((item) => item.name.startsWith(`${kind}.`))
    .map((item) => `${programId}/${item.name}`);

  if (targets.length === 0) {
    return { error: null };
  }

  const { error } = await supabase.storage.from(BUCKET).remove(targets);
  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}
