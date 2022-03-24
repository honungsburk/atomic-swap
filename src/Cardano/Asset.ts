import type {
  ScriptHash,
  BigNum,
  AssetName,
  Value,
  Assets,
} from "@emurgo/cardano-serialization-lib-browser";
import * as CardanoUtil from "./Util";
import * as CachingAPI from "../API/Caching";
import * as Types from "../API/BlockFrost/Types";
import adaLight from "../assets/img/ada-light-128x128.png";
import adaDark from "../assets/img/ada-dark-128x128.png";
import BlockFrostAPI from "../API/BlockFrost/BlockFrostAPI";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";
import * as Extra from "../Util/Extra";
import { NetworkID } from "cardano-web-bridge-wrapper";

////////////////////////////////////////////////////////////////////////////////
// Unions
////////////////////////////////////////////////////////////////////////////////

export type Metadata = AdaMetadata | NativeAssetMetadata;
export type Asset = Ada | NativeAsset;

////////////////////////////////////////////////////////////////////////////////
// Base Assets
////////////////////////////////////////////////////////////////////////////////

export type AdaMetadata = {
  kind: "ADA";
  displayName: string;
  symbol: string;
  decimals: 6;
  ticker: string;
  srcLight: string;
  srcDark: string;
  networkId: NetworkID;
};

export const adaTestMetadata: AdaMetadata = {
  kind: "ADA",
  displayName: "tADA",
  symbol: "t₳",
  decimals: 6,
  ticker: "TADA",
  srcLight: adaLight,
  srcDark: adaDark,
  networkId: "Testnet",
};

export const adaMetadata: AdaMetadata = {
  kind: "ADA",
  displayName: "ADA",
  symbol: "₳",
  decimals: 6,
  ticker: "ADA",
  srcLight: adaLight,
  srcDark: adaDark,
  networkId: "Mainnet",
};

export type NativeAssetMetadata = {
  kind: "NativeAsset";
  wasFound: boolean;
  displayName: string;
  src?: string;
  decimals: number;
  hash: ScriptHash;
  assetName: AssetName;
  networkId: NetworkID;
};

export type Ada = {
  kind: "ADA";
  amount: BigNum;
  metadata: AdaMetadata;
};

export function ada(networkID: NetworkID, amount: BigNum): Ada {
  return {
    kind: "ADA",
    amount: amount,
    metadata: networkID === "Mainnet" ? adaMetadata : adaTestMetadata,
  };
}

/**
 * Create unique IDs in a deterministic way for any asset.
 *
 * @param asset the asset for which you want an ID
 */
export function makeID(asset: Asset): string {
  if (asset.kind === "ADA") {
    return "ADA";
  } else {
    return unit(asset.metadata.hash, asset.metadata.assetName);
  }
}

export type NativeAsset = {
  kind: "NativeAsset";
  amount: BigNum;
  metadata: NativeAssetMetadata;
};

export const toValue =
  (lib: typeof CardanoSerializationLib) =>
  (ada: BigNum, nativeAssets: NativeAsset[]) => {
    const val = lib.Value.new(ada);

    const assetsIndex = new Map<string, Assets>();
    const hashIndex = new Map<string, ScriptHash>();

    nativeAssets.forEach((nativeAsset) => {
      const key = nativeAsset.metadata.hash.to_bech32("index");
      let assets: Assets | undefined = assetsIndex.get(key);

      if (assets === undefined) {
        assets = lib.Assets.new();
        assetsIndex.set(key, assets);
        hashIndex.set(key, nativeAsset.metadata.hash);
      }

      if (assets !== undefined) {
        assets.insert(nativeAsset.metadata.assetName, nativeAsset.amount);
      }
    });

    const mulAsset = lib.MultiAsset.new();

    assetsIndex.forEach((assets, key) => {
      const hash = hashIndex.get(key);
      if (hash !== undefined) {
        mulAsset.insert(hash, assets);
      }
    });

    val.set_multiasset(mulAsset);

    return val;
  };

export function nativeAsset(
  amount: BigNum,
  metadata: NativeAssetMetadata
): NativeAsset {
  return {
    kind: "NativeAsset",
    amount: amount,
    metadata: metadata,
  };
}

export function unit(hash: ScriptHash, assetName: AssetName): string {
  return Extra.toHex(hash.to_bytes()) + Extra.toHex(assetName.name());
}

export function deepCopy(nativeAsset: NativeAsset): NativeAsset {
  const newMetadata = { ...nativeAsset.metadata };
  return {
    kind: nativeAsset.kind,
    amount: nativeAsset.amount,
    metadata: newMetadata,
  };
}

export function policyID(nativeAsset: NativeAsset): string {
  return Extra.toHex(nativeAsset.metadata.hash.to_bytes());
}

export const buildNativeAsset =
  (lib: typeof CardanoSerializationLib) =>
  (amount: BigNum, _metadata: Types.Asset, networkId: NetworkID) => {
    const metadata: NativeAssetMetadata = {
      kind: "NativeAsset",
      wasFound: true,
      displayName: findBestDisplayName(_metadata),
      src: findBestSrc(_metadata),
      decimals: _metadata.metadata?.decimals ? _metadata.metadata?.decimals : 0,
      hash: CardanoUtil.toScriptHash(lib)(_metadata.policy_id),
      assetName: CardanoUtil.toAssetName(lib)(_metadata.asset_name),
      networkId: networkId,
    };

    return nativeAsset(amount, metadata);
  };

function findBestDisplayName(metadata: Types.Asset): string {
  const metadata_offChain = metadata.metadata;
  const metadata_on_chain = metadata.onchain_metadata;

  let name: string | undefined = undefined;

  if (metadata_offChain?.name) {
    name = metadata_offChain?.name;
  } else if (metadata_on_chain?.name) {
    name = metadata_on_chain?.name;
  } else {
    name = Extra.hexDecode(metadata.asset_name);
  }
  return name;
}

function findBestSrc(metadata: Types.Asset): string | undefined {
  const metadata_offChain = metadata.metadata;
  const metadata_on_chain = metadata.onchain_metadata;

  let src: string | undefined = undefined;

  if (metadata_offChain?.logo) {
    src = "data:image/png;base64," + metadata_offChain?.logo;
  } else if (
    metadata_on_chain &&
    metadata_on_chain.image &&
    !metadata_on_chain.image.startsWith("ipfs")
  ) {
    src = metadata_on_chain?.image;
  }

  return src;
}

/**
 *
 * Note: Will not actually fetch the real metadata. This is because a user could have
 * thousands of NFTs which would hit the API limit. Instead use the hydrate function
 * to find the appropriate metadata when you only need it for a tens of assets.
 *
 * @param netID the id of the network
 * @param value the values for which to look up values
 * @returns
 */
export function findMetadata(netID: NetworkID, value: Value): Asset[] {
  const assets = CardanoUtil.unpackAssets(value);
  const nativeAssets = [];

  nativeAssets.push(ada(netID, value.coin()));

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const metadataFallBack: NativeAssetMetadata = {
      kind: "NativeAsset",
      wasFound: false,
      displayName: Extra.hexDecode(Extra.toHex(asset.assetName.name())),
      src: undefined,
      decimals: 0,
      hash: asset.hash,
      assetName: asset.assetName,
      networkId: netID,
    };
    const metadata = nativeAsset(asset.amount, metadataFallBack);
    nativeAssets.push(metadata);
  }

  return nativeAssets;
}

export const hydrateMetadata =
  (lib: typeof CardanoSerializationLib) =>
  async (netID: NetworkID, assets: Asset[]) => {
    const hydrated: Asset[] = [];

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      if (asset.kind === "ADA") {
        hydrated.push(asset);
      } else if (!asset.metadata.wasFound) {
        const unitD = unit(asset.metadata.hash, asset.metadata.assetName);
        const metadataStored = await CachingAPI.getMetadata(
          unitD,
          window.localStorage,
          new BlockFrostAPI(netID)
        );
        const hydreatedAsset =
          metadataStored !== undefined
            ? buildNativeAsset(lib)(asset.amount, metadataStored, netID)
            : asset;
        hydrated.push(hydreatedAsset);
      } else {
        hydrated.push(asset);
      }
    }

    return hydrated;
  };
