import type {
  Address,
  AssetName,
  BigNum,
  ScriptHash,
  TransactionBody,
  Value,
} from "@emurgo/cardano-serialization-lib-browser";
import * as CardanoUtil from "./Util";
import * as Extra from "../Util/Extra";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";

/**
 *
 * @param scriptNumber the "identifier" of the script
 * @returns a scripthash
 */
export const mkScriptHash =
  (lib: typeof CardanoSerializationLib) => (scriptNumber: number) => {
    const script = lib.NativeScript.new_timelock_start(
      lib.TimelockStart.new(scriptNumber)
    ).hash();
    return lib.ScriptHash.from_bech32(script.to_bech32("script"));
  };

/**
 *
 * @param name the name of the asset
 * @returns
 */
export const mkAssetName =
  (lib: typeof CardanoSerializationLib) => (name: string) => {
    return CardanoUtil.toAssetName(lib)(Extra.hexEncode(name));
  };

export function mkEmptyTxBody(
  lib: typeof CardanoSerializationLib
): TransactionBody {
  const inputs = lib.TransactionInputs.new();
  const outputs = lib.TransactionOutputs.new();
  const fee = lib.BigNum.from_str("1000000");
  return lib.TransactionBody.new(inputs, outputs, fee);
}

/**
 *
 * @param index the index of the address to choose (1-10)
 * @returns an address
 */
export const mkAddress =
  (lib: typeof CardanoSerializationLib) =>
  (index = 0) => {
    const addresses = [
      "addr1q93tlhhe36k036324sdknm37g5dwnqrus3ys0ag7sxu0svy9cd647v42hwf5vsl0xmevqmsc4s3j3g0g2xte63ewc6qqtsqgll",
      "addr1q9320pzskwdlrz0wys9y90rmc00feumgxf4acq78rea0fdcgp26p574gwne5twv7e0p2nl863qt3vuyge0nu4tv4hgusgrchfy",
      "addr1q9rld6p4r0d2sg4t79faxyevudpxr3y3dvccr3uy5pymy4a725au6rywrnmnfk4fk8t0hmggz02r7upt42p9hprywxfsx8fzdg",
      "addr1q9lsgyjgunk86hp8p6w20fcnarh8a72xj70479h2a2lqxceh8cy3w9x486seavjf2h9xnulhwdnwa59654tmhm4gc5us09xeyt",
      "addr1qxsx929sx2h7yau7nnjw9lc8zty2lwl7z09jyj0z75eqw5u4s8cut0e2umzxkqfh7mt72uysc5nw30k52d80hj9dg2qqnumugg",
      "addr1q925vdz23wuh0hgl5m8jdzs0l9u5ppna4p86e3wmm4gse006f7m938xmjas2z63qetyhx3uk3zgly5825t48srmzt7gsn7dwfx",
      "addr1qxww7y0zelpst3u4ndzxuje6xvdgjg4hfxm8733krtgxv4083nr6rhgplqw5fw7pcj98dllawqtve4svyf3dgm57d6yqyx2td3",
      "addr1q94exnkdj95z5zl9w8wn304jlha7p7chkus988xt83axhdscdmzpkuej93ykh2upm8ua6xpa806zxsu7jcjmm7u9uw9sefurqe",
      "addr1qxsekzsh3wf4snmw5zr3svlk33qdsq6mej64jct4wrexhv6477fjatjdvw865ws473gqndexeca7gwwudepa03qhk62qe8lj7c",
      "addr1q8nyh27fgptgmwwpe8hvggw4s7hq8j7xefzjtwepexpz3cenpc68y8azuns9c9apv33pfjfd957r5vg4l9uy854n22zq9khz0x",
    ];

    return lib.Address.from_bech32(addresses[index]);
  };

export type SimpleNativeAssets = {
  hash: ScriptHash;
  assets: { assetName: AssetName; amount: BigNum }[];
}[];

export const mkValue =
  (lib: typeof CardanoSerializationLib) =>
  (ada: BigNum, nativeAssets?: SimpleNativeAssets) => {
    const value = lib.Value.new(ada);
    const mulAssets = lib.MultiAsset.new();
    nativeAssets?.forEach((asset) => {
      const assets = lib.Assets.new();
      asset.assets.forEach((namedAsset) =>
        assets.insert(namedAsset.assetName, namedAsset.amount)
      );
      mulAssets.insert(asset.hash, assets);
    });
    value.set_multiasset(mulAssets);
    return value;
  };

export const mkUtxo =
  (lib: typeof CardanoSerializationLib) =>
  (
    id: number,
    value: Value,
    address: Address = lib.Address.from_bech32(
      "addr1qxpyd7ysyec5x886p59mwzghj565z6pp4neur6rrdfq4jt248zrr9fdwgehqh6nxx9y5svnghj4385m04cd5w64wxycslr5396"
    )
  ) => {
    const txHash = lib.hash_transaction(mkEmptyTxBody(lib));
    const input = lib.TransactionInput.new(txHash, id);
    const output = lib.TransactionOutput.new(address, value);
    return lib.TransactionUnspentOutput.new(input, output);
  };
