import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Generate a unique ID for stored items.
 */
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const useAppStore = create(
  persist(
    (set, get) => ({
      /* ───────── State ───────── */

      // Collections: folders of saved API requests
      collections: [],

      // History: auto-saved log of every executed request
      history: [],

      // Favorites: array of request IDs
      favorites: [],

      // Environment variable sets
      environments: [
        {
          id: "env_default",
          name: "Default",
          variables: { BASE_URL: "https://jsonplaceholder.typicode.com" },
        },
      ],

      // Active environment ID
      activeEnvironment: "env_default",

      // Sidebar active tab
      sidebarTab: "collections",

      // Dark mode (always on for Silent Coder, but toggleable)
      darkMode: true,

      /* ───────── History Actions ───────── */

      addToHistory: (request) => {
        const entry = {
          id: uid(),
          method: request.method || "GET",
          url: request.url || "",
          status: request.status || 0,
          elapsed: request.elapsed || 0,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          history: [entry, ...state.history].slice(0, 100), // keep last 100
        }));
      },

      clearHistory: () => set({ history: [] }),

      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),

      /* ───────── Collection Actions ───────── */

      addCollection: (name) => {
        const collection = {
          id: uid(),
          name: name || "Untitled Collection",
          requests: [],
        };
        set((state) => ({
          collections: [...state.collections, collection],
        }));
        return collection.id;
      },

      deleteCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        })),

      renameCollection: (id, name) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        })),

      saveToCollection: (collectionId, request) => {
        const entry = {
          id: uid(),
          method: request.method || "GET",
          url: request.url || "",
          headers: request.headers || [],
          body: request.body || "",
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, requests: [...c.requests, entry] }
              : c
          ),
        }));
      },

      removeFromCollection: (collectionId, requestId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, requests: c.requests.filter((r) => r.id !== requestId) }
              : c
          ),
        })),

      /* ───────── Favorites Actions ───────── */

      toggleFavorite: (requestId) =>
        set((state) => ({
          favorites: state.favorites.includes(requestId)
            ? state.favorites.filter((id) => id !== requestId)
            : [...state.favorites, requestId],
        })),

      isFavorite: (requestId) => get().favorites.includes(requestId),

      /* ───────── Environment Actions ───────── */

      addEnvironment: (name, variables = {}) => {
        const env = {
          id: uid(),
          name: name || "New Environment",
          variables,
        };
        set((state) => ({
          environments: [...state.environments, env],
        }));
        return env.id;
      },

      deleteEnvironment: (id) =>
        set((state) => ({
          environments: state.environments.filter((e) => e.id !== id),
          activeEnvironment:
            state.activeEnvironment === id
              ? state.environments[0]?.id || null
              : state.activeEnvironment,
        })),

      updateEnvironment: (id, variables) =>
        set((state) => ({
          environments: state.environments.map((e) =>
            e.id === id ? { ...e, variables } : e
          ),
        })),

      renameEnvironment: (id, name) =>
        set((state) => ({
          environments: state.environments.map((e) =>
            e.id === id ? { ...e, name } : e
          ),
        })),

      setActiveEnvironment: (id) => set({ activeEnvironment: id }),

      /**
       * Replace {{VAR_NAME}} tokens in a string using the active environment.
       */
      resolveVariables: (str) => {
        const state = get();
        const env = state.environments.find(
          (e) => e.id === state.activeEnvironment
        );
        if (!env) return str;
        return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return env.variables[key] !== undefined ? env.variables[key] : match;
        });
      },

      /* ───────── UI State Actions ───────── */

      setSidebarTab: (tab) => set({ sidebarTab: tab }),

      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode })),

      /* ───────── Import / Export ───────── */

      exportData: () => {
        const state = get();
        return JSON.stringify(
          {
            collections: state.collections,
            history: state.history,
            favorites: state.favorites,
            environments: state.environments,
            activeEnvironment: state.activeEnvironment,
          },
          null,
          2
        );
      },

      importData: (jsonString) => {
        try {
          const data = JSON.parse(jsonString);
          set({
            collections: data.collections || [],
            history: data.history || [],
            favorites: data.favorites || [],
            environments: data.environments || [],
            activeEnvironment: data.activeEnvironment || null,
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "apiforge-storage", // localStorage key
      version: 1,
    }
  )
);

/* ───────── Bridge for Person B's RequestBuilder ───────── */
// RequestBuilder calls window.__addToHistory({ method, url, status, elapsed })
// We wire that up here so it flows into our Zustand store.
if (typeof window !== "undefined") {
  window.__addToHistory = (...args) => useAppStore.getState().addToHistory(...args);
}

export default useAppStore;
