import type {
  AssetName,
  Assets,
  BigNum,
  MultiAsset,
  ScriptHash,
  ScriptHashes,
  TransactionUnspentOutput,
  Value,
  Vkeywitnesses,
} from "@emurgo/cardano-serialization-lib-browser";
import AssetFingerprint from "@emurgo/cip14-js";
import { Buffer } from "buffer";
import * as Extra from "../Util/Extra";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";

/**
 * compute the asset fingerprint according to cip14
 * https://cips.cardano.org/cips/cip14/
 *
 * @param scriptHash the script hash
 * @param assetName the asset name
 * @returns the cip14 asset fingerprint
 */
export function assetFingerprint(
  scriptHash: ScriptHash,
  assetName: AssetName
): AssetFingerprint {
  return AssetFingerprint.fromParts(scriptHash.to_bytes(), assetName.name());
}

/**
 *
 * @param identifier The asset identifier
 * @returns the type of asset identifier
 */
export function assetIdentifierType(
  identifier: string
): "assetID" | "policyID" | "unknown" {
  // The hex length of a policyID is always 56
  if (identifier.length === 56 && Extra.isHex(identifier)) {
    return "policyID";
    // An asset fingerprint is always 44 characters long and starts with 'asset'
  } else if (identifier.length === 44 && identifier.startsWith("asset")) {
    return "assetID";
  } else {
    return "unknown";
  }
}

export const toAssetName =
  (lib: typeof CardanoSerializationLib) => (hexString: string) => {
    const assetName: Uint8Array = Uint8Array.from(
      Buffer.from(hexString, "hex")
    );
    return lib.AssetName.new(assetName);
  };

export const toScriptHash =
  (lib: typeof CardanoSerializationLib) => (policyID: string) => {
    const tmp: Uint8Array = Uint8Array.from(Buffer.from(policyID, "hex"));
    return lib.ScriptHash.from_bytes(tmp);
  };

// TODO: add tests
export function serializeUTXO(utxo: TransactionUnspentOutput): string {
  return Extra.toHex(utxo.to_bytes());
}

// TODO: add tests
export const deserializeUTXO =
  (lib: typeof CardanoSerializationLib) => (utxo: string) => {
    return lib.TransactionUnspentOutput.from_bytes(Extra.fromHex(utxo));
  };

export const mergeVKeyWitnesses =
  (lib: typeof CardanoSerializationLib) =>
  (left: Vkeywitnesses, right: Vkeywitnesses) => {
    const result = lib.Vkeywitnesses.new();

    for (let i = 0; i < left.len(); i++) {
      result.add(left.get(i));
    }

    for (let j = 0; j < right.len(); j++) {
      result.add(right.get(j));
    }

    return result;
  };

export type NativeAsset = {
  hash: ScriptHash;
  assetName: AssetName;
  amount: BigNum;
};

/**
 *
 * @param value the value from which to find all native assets
 * @returns all native assets in that value
 */
export function unpackAssets(value: Value): NativeAsset[] {
  const multi: MultiAsset | undefined = value.multiasset();

  if (multi) {
    const hashes: ScriptHashes = multi.keys();
    const newNativeAssets: NativeAsset[] = [];
    for (let i = 0; i < hashes.len(); i++) {
      const hash: ScriptHash = hashes.get(i);
      const assets: Assets | undefined = multi.get(hash);
      if (assets) {
        const assetNames = assets.keys();
        for (let i = 0; i < assetNames.len(); i++) {
          const assetName: AssetName = assetNames.get(i);
          const amount: BigNum | undefined = assets.get(assetName);
          if (amount) {
            newNativeAssets.push({
              assetName: assetName,
              amount: amount,
              hash: hash,
            });
          }
        }
      }
    }
    return newNativeAssets;
  }
  return [];
}

// export type Unit = string;

// export function mkUnit(hash: ScriptHash, assetName: AssetName): Unit {
//   return Extra.toHex(hash.to_bytes()) + Extra.toHex(assetName.name());
// }

// //TODO: add tests
// export function sameAssetType(x: NativeAsset, y: NativeAsset): boolean {
//   return (
//     equal(x.assetName.to_bytes(), y.assetName.to_bytes()) &&
//     equal(x.hash.to_bytes(), y.hash.to_bytes())
//   );
// }

// export function nativeAssetPrettyName(asset: NativeAsset): string {
//   return Extra.hexDecode(Extra.toHex(asset.assetName.name()));
// }

// export function nativeAssetIntAmount(asset: NativeAsset): number {
//   return parseInt(asset.amount.to_str());
// }

// function equal(buf1: Uint8Array, buf2: Uint8Array): boolean {
//   if (buf1.byteLength !== buf2.byteLength) return false;
//   for (let i = 0; i !== buf1.byteLength; i++) {
//     if (buf1[i] !== buf2[i]) return false;
//   }
//   return true;
// }
