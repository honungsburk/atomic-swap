import type {
  AssetName,
  BigNum,
  ScriptHash,
  Value,
} from "@emurgo/cardano-serialization-lib-browser";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";
import * as MathUtil from "../Util/Math";
import * as Extra from "../Util/Extra";

/**
 *
 * @param scriptHash The hash of the script
 * @param assetName the asset name
 * @param value the value to lookup in
 * @returns the amount of that asset in the value or 0
 */
export const lookup =
  (lib: typeof CardanoSerializationLib) =>
  (scriptHash: ScriptHash, assetName: AssetName, value: Value) => {
    const v = value.multiasset()?.get(scriptHash)?.get(assetName);
    return v ? v : lib.BigNum.zero();
  };

/**
 *
 * @param lhs left-hand side
 * @param rhs right-hand side
 * @returns whether or not the two values are equal
 */
export function eq(lhs: Value, rhs: Value): boolean {
  return lhs.compare(rhs) === 0;
}

/**
 *
 * @param value the value we shall iterate over
 * @param fn the function that gets applied to each native asseet
 */
export function forEach(
  value: Value,
  fn: (hash: ScriptHash, assetName: AssetName, amount: BigNum) => void
): void {
  const mulAsset = value.multiasset();
  if (mulAsset !== undefined) {
    const hashes = mulAsset.keys();
    for (let i = 0; i < hashes.len(); i++) {
      const hash = hashes.get(i);
      const assets = mulAsset.get(hash);
      if (assets !== undefined) {
        const assetNames = assets.keys();
        for (let j = 0; j < assetNames.len(); j++) {
          const assetName = assetNames.get(j);
          const amount = assets.get(assetName);
          if (amount !== undefined) {
            fn(hash, assetName, amount);
          }
        }
      }
    }
  }
}

export function encode(value: Value): string {
  return Extra.toHex(value.to_bytes());
}

export const decode =
  (lib: typeof CardanoSerializationLib) => (value: string) => {
    return lib.Value.from_bytes(Extra.fromHex(value));
  };

export const copy = (lib: typeof CardanoSerializationLib) => (value: Value) => {
  return decode(lib)(encode(value));
};

/**
 * This is a pure function!
 *
 * @param value
 * @param hash
 * @param assetName
 * @returns
 */
export const removeAsset =
  (lib: typeof CardanoSerializationLib) =>
  (value: Value, hash: ScriptHash, assetName: AssetName) => {
    const valCopy = copy(lib)(value);
    const mulAsset = valCopy.multiasset();
    const amount = mulAsset?.get(hash)?.get(assetName);
    if (mulAsset !== undefined && amount !== undefined) {
      const removeAsset = lib.MultiAsset.new();
      const assets = lib.Assets.new();
      assets.insert(assetName, amount);
      removeAsset.insert(hash, assets);
      valCopy.set_multiasset(mulAsset.sub(removeAsset));
    }
    return valCopy;
  };

/**
 * This is a pure function!
 *
 * @param value the value to add the asset to
 * @param hash the hash of the asset
 * @param assetName the assetname
 * @param amount the amount
 * @returns a new value with the given amount of the asset
 */
export const addAsset =
  (lib: typeof CardanoSerializationLib) =>
  (value: Value, hash: ScriptHash, assetName: AssetName, amount: BigNum) => {
    const valCopy = copy(lib)(value);
    const mulAsset = valCopy.multiasset();
    if (mulAsset !== undefined) {
      const assets = mulAsset.get(hash);
      if (assets !== undefined) {
        assets.insert(assetName, amount);
        mulAsset.insert(hash, assets);
      } else {
        const newAssets = lib.Assets.new();
        newAssets.insert(assetName, amount);
        mulAsset.insert(hash, newAssets);
      }
      valCopy.set_multiasset(mulAsset);
    } else {
      const mulAsset = lib.MultiAsset.new();
      const newAssets = lib.Assets.new();
      newAssets.insert(assetName, amount);
      mulAsset.insert(hash, newAssets);
      valCopy.set_multiasset(mulAsset);
    }

    return valCopy;
  };

/**
 *
 * You find a good explenation as to the algorithm here:
 * https://github.com/input-output-hk/cardano-ledger/blob/master/doc/explanations/min-utxo-mary.rst
 *
 * @param value the value
 * @returns the size in bytes
 */
export function sizeOfValue(value: Value): number {
  const pidSize = 28; //length of policy id, is determined by current hash algorithm
  let sumAssetNameLengths = 0;
  let numPIDs = 0;
  let numAssets = 0;
  const multiAsset = value.multiasset();

  if (multiAsset !== undefined) {
    const keys = multiAsset.keys();
    numPIDs = keys.len();
    for (let i = 0; i < keys.len(); i++) {
      const key = keys.get(i);
      const assets = multiAsset.get(key);
      if (assets !== undefined) {
        numAssets = numAssets + assets.len();
        const assetNames = assets.keys();
        for (let j = 0; j < assetNames.len(); j++) {
          sumAssetNameLengths =
            sumAssetNameLengths + assetNames.get(j).name().length;
        }
      }
    }
  }

  return (
    6 +
    MathUtil.roundupBytesToWords(
      numAssets * 12 + sumAssetNameLengths + numPIDs * pidSize
    )
  );
}
