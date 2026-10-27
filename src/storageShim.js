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

  // Seperti get(), tapi sekaligus mengembalikan updatedAt (penanda versi di server)
  async getWithMeta(key) {
    const userId = requireUser();
    const { data, error } = await supabase
      .from("storage_kv")
      .select("value, updated_at")
      .eq("user_id", userId)
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { key, value: data.value, updatedAt: data.updated_at };
  },

  // Cek ringan: hanya penanda versi (null = belum ada baris)
  async peekUpdatedAt(key) {
    const userId = requireUser();
    const { data, error } = await supabase
      .from("storage_kv")
      .select("updated_at")
      .eq("user_id", userId)
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    return data ? data.updated_at : null;
  },

  // Tulis HANYA kalau versi di server masih sama dengan yang terakhir kita lihat.
  // expectedUpdatedAt = null artinya kita belum pernah melihat baris ini (harus belum ada).
  // Return { ok: true, updatedAt } atau { ok: false, conflict: true }.
  async setIfMatch(key, value, expectedUpdatedAt) {
    const userId = requireUser();
    const now = new Date().toISOString();
    if (expectedUpdatedAt == null) {
      const { data, error } = await supabase
        .from("storage_kv")
        .insert({ user_id: userId, key, value, updated_at: now })
        .select("updated_at")
        .maybeSingle();
      if (error) {
        if (error.code === "23505") return { ok: false, conflict: true };
        throw error;
      }
      return { ok: true, updatedAt: data?.updated_at || now };
    }
    const { data, error } = await supabase
      .from("storage_kv")
      .update({ value, updated_at: now })
      .eq("user_id", userId)
      .eq("key", key)
      .eq("updated_at", expectedUpdatedAt)
      .select("updated_at");
    if (error) throw error;
    if (!data || data.length === 0) return { ok: false, conflict: true };
    return { ok: true, updatedAt: data[0].updated_at };
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
