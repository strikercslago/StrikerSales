import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.generated";
import type { UploadSiteProjectFileInput, UploadedSiteProjectFile } from "@/types/site-project";

export const SITE_PROJECT_BUCKET = "site-projects";
export const SITE_PROJECT_MAX_FILE_SIZE = 50 * 1024 * 1024;
export const SITE_PROJECT_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml",
  "application/pdf", "font/woff", "font/woff2", "video/mp4", "video/webm",
]);

function safePathSegment(value: string) {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

export class SiteProjectStorageService {
  constructor(private readonly client: SupabaseClient<Database> = getSupabaseClient()) {}

  async upload(input: UploadSiteProjectFileInput): Promise<UploadedSiteProjectFile> {
    if (!SITE_PROJECT_ALLOWED_MIME_TYPES.has(input.file.type)) throw new Error("Tipo de arquivo não permitido.");
    if (input.file.size <= 0 || input.file.size > SITE_PROJECT_MAX_FILE_SIZE) throw new Error("O arquivo deve ter no máximo 50 MB.");

    const category = safePathSegment(input.category);
    const uniqueName = `${crypto.randomUUID()}-${safePathSegment(input.file.name)}`;
    const objectPath = `${input.ownerId}/${input.projectId}/${category}/${uniqueName}`;
    const { error: uploadError } = await this.client.storage.from(SITE_PROJECT_BUCKET).upload(objectPath, input.file, {
      contentType: input.file.type,
      upsert: false,
    });
    if (uploadError) throw new Error(`Não foi possível enviar o arquivo: ${uploadError.message}`);

    const { data: metadata, error: metadataError } = await this.client.from("site_project_files").insert({
      project_id: input.projectId,
      object_path: objectPath,
      category,
      original_name: input.file.name,
      mime_type: input.file.type,
      size_bytes: input.file.size,
    }).select("*").single();

    if (metadataError) {
      await this.client.storage.from(SITE_PROJECT_BUCKET).remove([objectPath]);
      throw new Error(`Não foi possível registrar o arquivo: ${metadataError.message}`);
    }

    const { data: signed, error: signedError } = await this.client.storage.from(SITE_PROJECT_BUCKET).createSignedUrl(objectPath, 300);
    if (signedError) throw new Error(`Arquivo enviado, mas a URL assinada falhou: ${signedError.message}`);
    return { metadata, signedUrl: signed.signedUrl };
  }

  async createSignedUrl(objectPath: string, expiresInSeconds = 300) {
    const { data, error } = await this.client.storage.from(SITE_PROJECT_BUCKET).createSignedUrl(objectPath, expiresInSeconds);
    if (error) throw new Error(`Não foi possível abrir o arquivo: ${error.message}`);
    return data.signedUrl;
  }
}
