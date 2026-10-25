// Shim window.storage using Supabase so the component's existing
// window.storage.get/set calls now read/write per logged-in user,
// stored in the cloud (table: storage_kv) instead of localStorage.

import { supabase } from "./supabaseClient.js";

let currentUserId = null;

export function setStorageUser(userId) {
  currentUserId = userId || null;
}

function requireUser() {
  if (!currentUserId) {
    throw new Error("Belum login — tidak ada user aktif untuk menyimpan data.");
  }
  return currentUserId;
}

window.storage = {
  async get(key) {
    const userId = requireUser();
    const { data, error } = await supabase
      .from("storage_kv")
      .select("value")
      .eq("user_id", userId)
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { key, value: data.value, shared: false };
  },

  async set(key, value) {
    const userId = requireUser();
    const { error } = await supabase
      .from("storage_kv")
      .upsert(
        { user_id: userId, key, value, updated_at: new Date().toISOString() },
        { onConflict: "user_id,key" }
      );
    if (error) throw error;
    return { key, value, shared: false };
  },

  async delete(key) {
    const userId = requireUser();
    const { error } = await supabase
      .from("storage_kv")
      .delete()
      .eq("user_id", userId)
      .eq("key", key);
    if (error) throw error;
    return { key, deleted: true, shared: false };
  },

  async list(prefix = "") {
    const userId = requireUser();
    const { data, error } = await supabase
      .from("storage_kv")
      .select("key")
      .eq("user_id", userId)
      .like("key", `${prefix}%`);
    if (error) throw error;
    return { keys: (data || []).map((r) => r.key), prefix, shared: false };
  },
};
