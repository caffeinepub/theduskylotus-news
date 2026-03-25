import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import {
  deriveIdentityFromPassword,
  useAdminPassword,
} from "./useAdminPassword";

const ACTOR_QUERY_KEY = "actor";
export function useActor() {
  const { getPassword } = useAdminPassword();
  const password = getPassword();
  const queryClient = useQueryClient();

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, password ?? "anonymous"],
    queryFn: async () => {
      if (!password) {
        return await createActorWithConfig();
      }

      const identity = await deriveIdentityFromPassword(password);
      return await createActorWithConfig({ agentOptions: { identity } });
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
