import type { CreateSiteProjectBundleInput, SiteProject } from "@/types/site-project";
import type { SiteProjectRepository } from "./project-repository";
import { SupabaseSiteProjectRepository } from "./supabase-site-project-repository";

export class SiteProjectService {
  constructor(private readonly repository: SiteProjectRepository = new SupabaseSiteProjectRepository()) {}

  async createProject(input: CreateSiteProjectBundleInput, responsibleUserId: string): Promise<SiteProject> {
    const client = await this.repository.createClient(input.client);
    try {
      return await this.repository.createProject({
        ...input.project,
        owner_id: responsibleUserId,
        client_id: client.id,
        responsible_user_id: responsibleUserId,
      });
    } catch (error) {
      await this.repository.deleteClient(client.id).catch(() => undefined);
      throw error;
    }
  }
}
