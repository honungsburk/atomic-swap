import * as Caching from "./Caching";
import * as Types from "./BlockFrost/Types";
import PureStorage from "./PureStorage";
import { expect, test } from "vitest";
class PureAPI implements Types.AssetsAPI {
  private store: Map<string, Types.Asset | Types.Error>;

  constructor(
    responses?: { key: string; response: Types.Asset | Types.Error }[]
  ) {
    this.store = new Map();
    if (responses !== undefined) {
      responses.forEach((response) =>
        this.store.set(response.key, response.response)
      );
    }
  }

  async assetsById(unit: string): Promise<Types.Asset | Types.Error> {
    const response = this.store.get(unit);
    if (response !== undefined) {
      return response;
    } else {
      return {
        name: "BlockfrostServerError",
        status_code: 404,
        error: "Could not find " + unit,
      };
    }
  }
}

test("Caching.getMetadata - not in cache - not found in API", async () => {
  const cache = new PureStorage();
  const api = new PureAPI();
  const result = await Caching.getMetadata("fakeid", cache, api);
  expect(result).toBe(undefined);
});

test("Caching.getMetadata - puts stuff in cache", async () => {
  const cache = new PureStorage();
  const id = "fakeid";
  const asset: Types.Asset = {
    asset: "fakeasset",
    policy_id: "fakepolicyid",
    asset_name: "fakename",
    fingerprint: "fakefingerprint",
    quantity: "100",
    initial_mint_tx_hash: "fakehash",
    mint_or_burn_count: 0,
    onchain_metadata: null,
    metadata: null,
  };
  const api = new PureAPI([{ key: id, response: asset }]);
  const result = await Caching.getMetadata(id, cache, api);
  expect(result).toBe(asset);
  expect(cache.getItem(id)).toBeTruthy();
});

test("Caching.getMetadata - can handle missing asset", async () => {
  const cache = new PureStorage();
  const id = "fakeid";
  const asset: Types.Asset = {
    asset: "fakeasset",
    policy_id: "fakepolicyid",
    asset_name: "fakename",
    fingerprint: "fakefingerprint",
    quantity: "100",
    initial_mint_tx_hash: "fakehash",
    mint_or_burn_count: 0,
    onchain_metadata: null,
    metadata: null,
  };
  const api = new PureAPI([{ key: id, response: asset }]);
  const result = await Caching.getMetadata("otherfakeid", cache, api);
  expect(result).toBe(undefined);
  expect(cache.getItem("otherfakeid")).toBeTruthy();
});

test("Caching.getMetadata - throw on Internal Server Error", async () => {
  const cache = new PureStorage();
  const id = "fakeid";
  const asset: Types.BlockfrostServerError = {
    name: "BlockfrostServerError",
    status_code: 500,
    error: "Internal Server Error",
  };
  const api = new PureAPI([{ key: id, response: asset }]);
  let didThrow = false;
  await Caching.getMetadata(id, cache, api).catch(() => {
    didThrow = true;
  });

  expect(didThrow).toBeTruthy();
});
