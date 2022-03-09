import * as CardanoUtil from "../Cardano/Util";
import * as Types from "./BlockFrost/Types";
import * as Extra from "../Util/Extra";

const currentVersion = 3;

// Number of milliseconds a cached object is valid
const validFor = 1000 * 60 * 60 * 24;

type CacheObject = {
  version: number;
  timestamp: number;
};

type Cache = NotFoundCache | MetadataCache;

type MetadataCache = {
  kind: "metadata";
  metadata: Types.Asset;
} & CacheObject;

type NotFoundCache = {
  kind: "notfound";
} & CacheObject;

/**
 *
 * Note: Caches all the reponses for one hour.
 *
 * @param asset the asset to look up
 * @returns the metadata for that asset or undefined if it could not be found on the blockchain
 */
export async function getMetadata(
  asset: CardanoUtil.NativeAsset | string,
  cache: Storage,
  api: Types.AssetsAPI
): Promise<Types.Asset | undefined> {
  const unit =
    typeof asset === "string"
      ? asset
      : Extra.toHex(asset.hash.to_bytes()) +
        Extra.toHex(asset.assetName.name());
  const cachedMetadataS: string | null = cache.getItem(unit);
  const start: number = Date.now();

  try {
    if (cachedMetadataS !== null) {
      const cachedMetadata: Cache = JSON.parse(cachedMetadataS);
      if (
        cachedMetadata.timestamp < start + validFor &&
        cachedMetadata.version > 2
      ) {
        //The cached object is valid so it can be returned
        if (
          cachedMetadata.kind === "metadata" &&
          Types.isAsset(cachedMetadata.metadata)
        ) {
          return cachedMetadata.metadata;
        } else {
          cache.removeItem(unit);
          return undefined;
        }
      }
    }
  } catch (err) {
    // If there was an error it is best to delete the cache entry since it might be corrupt
    cache.removeItem(unit);
    throw err;
  }

  // If we are here it means that the cache was either invalid or nonexistant
  const assetMetadata: Types.Asset | Types.Error = await api.assetsById(unit);
  //TOOD: must handle over API limit

  if (Types.isError(assetMetadata)) {
    if (assetMetadata.status_code === 404) {
      const cachedNotFound: NotFoundCache = {
        kind: "notfound",
        version: currentVersion,
        timestamp: start,
      };
      cache.setItem(unit, JSON.stringify(cachedNotFound));
      return undefined;
    } else {
      throw assetMetadata;
    }
    // CHECK that it actually is what you expect not just the negative!
  } else if (Types.isAsset(assetMetadata)) {
    const cachedMetadata: MetadataCache = {
      kind: "metadata",
      version: currentVersion,
      timestamp: start,
      metadata: assetMetadata,
    };
    cache.setItem(unit, JSON.stringify(cachedMetadata));
    return assetMetadata;
  } else {
    return undefined;
  }
}
