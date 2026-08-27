import { describe, expect, it, vi } from "vitest";
import { SiteProjectService } from "./site-project-service";
import type { SiteProjectRepository } from "./project-repository";
import type { Client, CreateSiteProjectBundleInput, SiteProject } from "@/types/site-project";

const input: CreateSiteProjectBundleInput = {
  client: { name: "Cliente Teste", company: "Empresa Teste" },
  project: { name: "Projeto Teste", platform: "Next.js" },
};

const client = { id: "client-1" } as Client;
const project = { id: "project-1", methodology_version: "1.1" } as SiteProject;

describe("SiteProjectService", () => {
  it("vincula cliente, proprietário e responsável ao criar o projeto", async () => {
    const createClient = vi.fn().mockResolvedValue(client);
    const createProject = vi.fn().mockResolvedValue(project);
    const repository = { createClient, createProject, deleteClient: vi.fn() } as unknown as SiteProjectRepository;

    await expect(new SiteProjectService(repository).createProject(input, "user-1")).resolves.toBe(project);
    expect(createProject).toHaveBeenCalledWith(expect.objectContaining({
      name: "Projeto Teste", client_id: "client-1", owner_id: "user-1", responsible_user_id: "user-1",
    }));
  });

  it("remove o cliente incompleto se a criação do projeto falhar", async () => {
    const deleteClient = vi.fn().mockResolvedValue(undefined);
    const repository = {
      createClient: vi.fn().mockResolvedValue(client),
      createProject: vi.fn().mockRejectedValue(new Error("falha")),
      deleteClient,
    } as unknown as SiteProjectRepository;

    await expect(new SiteProjectService(repository).createProject(input, "user-1")).rejects.toThrow("falha");
    expect(deleteClient).toHaveBeenCalledWith("client-1");
  });
});
