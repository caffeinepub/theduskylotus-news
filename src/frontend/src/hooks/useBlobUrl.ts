import { HttpAgent } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

const SENTINEL = "!caf!";

export async function getBlobDirectUrl(hash: string): Promise<string> {
  if (!hash) throw new Error("Hash cannot be empty");
  const config = await loadConfig();
  const cleanHash = hash.startsWith(SENTINEL)
    ? hash.substring(SENTINEL.length)
    : hash;
  return `${config.storage_gateway_url}/v1/blob/?blob_hash=${encodeURIComponent(cleanHash)}&owner_id=${encodeURIComponent(config.backend_canister_id)}&project_id=${encodeURIComponent(config.project_id)}`;
}

export function useBlobUrl(hash?: string | null): string | undefined {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!hash) {
      setUrl(undefined);
      return;
    }
    getBlobDirectUrl(hash)
      .then(setUrl)
      .catch(() => setUrl(undefined));
  }, [hash]);

  return url;
}

export function useFileUpload() {
  const { identity } = useInternetIdentity();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const config = await loadConfig();
      const agent = new HttpAgent({
        host: config.backend_host,
        identity: identity || undefined,
      });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey();
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, setProgress);
      return hash;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
      throw e;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress, error };
}
