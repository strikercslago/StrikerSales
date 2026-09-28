import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "@/types/database.generated";
import type { ProspectingState } from "@/types/prospecting";
import { getSupabaseClient } from "@/lib/supabase/client";
import { emptyProspectingState } from "./prospecting";

const SETTING_KEY = "prospecting_central_v1";

function validState(value: unknown): ProspectingState {
  if (!value || typeof value !== "object" || (value as ProspectingState).version !== 1) return emptyProspectingState();
  const state = value as ProspectingState;
  return { version: 1, campaigns: Array.isArray(state.campaigns) ? state.campaigns : [], searches: Array.isArray(state.searches) ? state.searches : [] };
}

export class ProspectingRepository {
  constructor(private readonly client: SupabaseClient = getSupabaseClient()) {}
  async load() {
    const { data, error } = await this.client.from("app_settings").select("value").eq("key", SETTING_KEY).maybeSingle();
    if (error) throw new Error(`Não foi possível carregar a central: ${error.message}`);
    return validState(data?.value);
  }
  async save(state: ProspectingState) {
    const { error } = await this.client.from("app_settings").upsert({ key: SETTING_KEY, value: state as unknown as Json }, { onConflict: "owner_id,key" });
    if (error) throw new Error(`Não foi possível salvar a central: ${error.message}`);
    return state;
  }
}
