import * as Cardano from "@emurgo/cardano-serialization-lib-nodejs";
import * as ValueExtra from "./ValueExtra";
import * as TestUtil from "./TestUtil";
import { expect, test } from "vitest";
const mkScriptHash = TestUtil.mkScriptHash(Cardano);
const mkAssetName = TestUtil.mkAssetName(Cardano);

////////////////////////////////////////////////////////////////////////////////
// ValueExtra.sizeOfValue(value, utxos)
////////////////////////////////////////////////////////////////////////////////

// Tests are taken from: https://github.com/input-output-hk/cardano-ledger/blob/master/doc/explanations/min-utxo-mary.rst

test("sizeOfValue(value) - no policyID - no asset names", () => {
  const val = Cardano.Value.new(Cardano.BigNum.from_str("10"));

  expect(ValueExtra.sizeOfValue(val)).toEqual(6);
});

test("sizeOfValue(value) - One policyID - no asset names", () => {
  const val = Cardano.Value.new(Cardano.BigNum.from_str("10"));
  const mulAsset = Cardano.MultiAsset.new();
  const rndScript = mkScriptHash(100);
  const assets = Cardano.Assets.new();
  assets.insert(
    Cardano.AssetName.new(new Uint8Array()),
    Cardano.BigNum.from_str("1")
  );
  mulAsset.insert(rndScript, assets);
  val.set_multiasset(mulAsset);
  expect(ValueExtra.sizeOfValue(val)).toEqual(11);
});

test("sizeOfValue(value) - One policyID - one 1-character asset name", () => {
  const val = Cardano.Value.new(Cardano.BigNum.from_str("10"));
  const mulAsset = Cardano.MultiAsset.new();
  const rndScript = mkScriptHash(100);
  const assets = Cardano.Assets.new();
  assets.insert(mkAssetName("a"), Cardano.BigNum.from_str("10"));
  mulAsset.insert(rndScript, assets);
  val.set_multiasset(mulAsset);
  expect(ValueExtra.sizeOfValue(val)).toEqual(12);
});

test("sizeOfValue(value) - One policyID - one 32-character asset name", () => {
  const val = Cardano.Value.new(Cardano.BigNum.from_str("10"));
  const mulAsset = Cardano.MultiAsset.new();
  const rndScript = mkScriptHash(100);
  const assets = Cardano.Assets.new();
  assets.insert(mkAssetName("a".repeat(32)), Cardano.BigNum.from_str("10"));
  mulAsset.insert(rndScript, assets);
  val.set_multiasset(mulAsset);
  expect(ValueExtra.sizeOfValue(val)).toEqual(15);
});

test("sizeOfValue(value) - One policyID - 110 32-character asset name", () => {
  const val = Cardano.Value.new(Cardano.BigNum.from_str("10"));
  const mulAsset = Cardano.MultiAsset.new();
  const rndScript = mkScriptHash(100);
  const assets = Cardano.Assets.new();

  for (let i = 0; i < 110; i++) {
    const asset_name = (i.toString() + "-").repeat(16).slice(0, 32);
    assets.insert(mkAssetName(asset_name), Cardano.BigNum.from_str("10"));
  }
  mulAsset.insert(rndScript, assets);
  val.set_multiasset(mulAsset);
  expect(ValueExtra.sizeOfValue(val)).toEqual(615);
});

test("sizeOfValue(value) - 60 policyIDs - each with one 32-character asset name", () => {
  const val = Cardano.Value.new(Cardano.BigNum.from_str("10"));
  const mulAsset = Cardano.MultiAsset.new();

  for (let i = 0; i < 60; i++) {
    const assets = Cardano.Assets.new();
    const rndScript = mkScriptHash(i + 10);
    const asset_name = (i.toString() + "-").repeat(16).slice(0, 32);
    assets.insert(mkAssetName(asset_name), Cardano.BigNum.from_str("10"));
    mulAsset.insert(rndScript, assets);
  }

  val.set_multiasset(mulAsset);
  expect(ValueExtra.sizeOfValue(val)).toEqual(546);
});

////////////////////////////////////////////////////////////////////////////////
// ValueExtra.addAsset(value, hash, assetName, amount)
////////////////////////////////////////////////////////////////////////////////

const addAsset = ValueExtra.addAsset(Cardano);
const lookup = ValueExtra.lookup(Cardano);

test("ValueExtra.addAsset - add asset to empty value", () => {
  const val = Cardano.Value.zero();
  const hash = mkScriptHash(10);
  const assetName = mkAssetName("hello");
  const amount = Cardano.BigNum.from_str("1000");

  const newVal = addAsset(val, hash, assetName, amount);

  // Function is pure!
  expect(ValueExtra.eq(val, Cardano.Value.zero())).toBeTruthy();

  // We have our asset!
  expect(lookup(hash, assetName, newVal).to_str()).toBe("1000");
});

test("ValueExtra.addAsset - can override value", () => {
  const val = Cardano.Value.zero();
  const hash = mkScriptHash(10);
  const assetName = mkAssetName("hello");
  const amount1 = Cardano.BigNum.from_str("1000");
  const amount2 = Cardano.BigNum.from_str("1");

  let newVal = addAsset(val, hash, assetName, amount1);
  newVal = addAsset(newVal, hash, assetName, amount2);

  // Function is pure!
  expect(ValueExtra.eq(val, Cardano.Value.zero())).toBeTruthy();

  // We have our asset!
  expect(lookup(hash, assetName, newVal).to_str()).toBe("1");
});

test("ValueExtra.addAsset - adding a value does not remove other values", () => {
  const val = Cardano.Value.zero();
  const hash1 = mkScriptHash(10);
  const hash2 = mkScriptHash(11);
  const assetName1 = mkAssetName("hello");
  const assetName2 = mkAssetName("hello2");
  const amount = Cardano.BigNum.from_str("1000");

  let newVal = ValueExtra.addAsset(Cardano)(val, hash1, assetName1, amount);
  newVal = ValueExtra.addAsset(Cardano)(newVal, hash1, assetName2, amount);
  newVal = ValueExtra.addAsset(Cardano)(newVal, hash2, assetName1, amount);

  // Function is pure!
  expect(ValueExtra.eq(val, Cardano.Value.zero())).toBeTruthy();

  // We have our asset!
  expect(lookup(hash1, assetName1, newVal).to_str()).toBe("1000");
  expect(lookup(hash1, assetName2, newVal).to_str()).toBe("1000");
  expect(lookup(hash2, assetName1, newVal).to_str()).toBe("1000");
});

////////////////////////////////////////////////////////////////////////////////
// ValueExtra.removeAsset(value, hash, assetName)
////////////////////////////////////////////////////////////////////////////////

const removeAsset = ValueExtra.removeAsset(Cardano);

test("ValueExtra.removeAsset - can remove one asset", () => {
  const hash = mkScriptHash(10);
  const assetName = mkAssetName("hello");
  const amount = Cardano.BigNum.from_str("1000");
  const val = ValueExtra.addAsset(Cardano)(
    Cardano.Value.zero(),
    hash,
    assetName,
    amount
  );

  const newVal = removeAsset(val, hash, assetName);

  // Function is pure!
  expect(ValueExtra.lookup(Cardano)(hash, assetName, val).to_str()).toBe(
    "1000"
  );

  // It is empty again!
  expect(ValueExtra.eq(newVal, Cardano.Value.zero())).toBeTruthy();
});

test("ValueExtra.removeAsset - empty produces empty", () => {
  const val = Cardano.Value.zero();
  const hash = mkScriptHash(10);
  const assetName = mkAssetName("hello");

  const newVal = removeAsset(val, hash, assetName);

  // Function is pure!
  expect(ValueExtra.eq(val, Cardano.Value.zero())).toBeTruthy();

  // Asset has been removed
  expect(ValueExtra.lookup(Cardano)(hash, assetName, newVal).to_str()).toBe(
    "0"
  );
});

test("ValueExtra.removeAsset - adding a value does not remove other values", () => {
  const val = Cardano.Value.zero();
  const hash1 = mkScriptHash(10);
  const hash2 = mkScriptHash(11);
  const assetName1 = mkAssetName("hello");
  const assetName2 = mkAssetName("hello2");
  const amount = Cardano.BigNum.from_str("1000");

  let newVal = ValueExtra.addAsset(Cardano)(val, hash1, assetName1, amount);
  newVal = ValueExtra.addAsset(Cardano)(newVal, hash1, assetName2, amount);
  newVal = ValueExtra.addAsset(Cardano)(newVal, hash2, assetName1, amount);

  const removedVal = removeAsset(newVal, hash1, assetName1);

  // Function is pure!
  expect(ValueExtra.lookup(Cardano)(hash1, assetName1, newVal).to_str()).toBe(
    "1000"
  );

  // Asset has been removed
  expect(
    ValueExtra.lookup(Cardano)(hash1, assetName1, removedVal).to_str()
  ).toBe("0");
});
