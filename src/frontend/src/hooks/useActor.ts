import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import {
  deriveIdentityFromPassword,
  useAdminPassword,
} from "./useAdminPassword";

const ACTOR_QUERY_KEY = "actor";
export function useActor() {
  const { getPassword, isAuthenticated } = useAdminPassword();
  const queryClient = useQueryClient();

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, isAuthenticated ? "admin" : "anon"],
    queryFn: async () => {
      const password = getPassword();

      if (!password) {
        // Anonymous actor for public pages
        return await createActorWithConfig();
      }

      // Derive the deterministic identity from the stored password
      const identity = await deriveIdentityFromPassword(password);
      const actor = await createActorWithConfig({
        agentOptions: { identity },
      });

      // If an admin token is present in the URL, register this identity as admin
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      if (adminToken) {
        try {
          await actor._initializeAccessControlWithSecret(adminToken);
        } catch {
          // Already initialized -- safe to ignore
        }
      }

      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
      queryClient.refetchQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
