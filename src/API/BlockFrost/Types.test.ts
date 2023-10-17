import * as Types from "./Types";
import { describe, it } from "vitest";

// Error Types

describe("isAPIError", () => {
  it("can recognize an APIError", ({ expect }) => {
    const notFound: Types.APIError = {
      name: "APIError",
      status: 404,
      type: "not_found",
      message: "The requested item could not be found",
      timestamp: "2021-02-19T08:52:25.000Z",
      path: "/api/v0/assets/123asdeasd12443q",
    };
    expect(Types.isAPIError(notFound)).toBeTruthy();
  });

  it("can handle null and undefined", ({ expect }) => {
    expect(Types.isAPIError(undefined)).toBeFalsy();
    expect(Types.isAPIError(null)).toBeFalsy();
  });
});

describe("isBlockfrostClientError", () => {
  it("can recognize a BlockfrostClientError", ({ expect }) => {
    const notFound: Types.BlockfrostClientError = {
      name: "BlockfrostClientError",
      status_code: 404,
      message: "Unprecedented error!",
    };
    expect(Types.isBlockfrostClientError(notFound)).toBeTruthy();
  });
});

describe("isBlockfrostServerError", () => {
  it("can recognize a BlockfrostServerError", ({ expect }) => {
    const notFound: Types.BlockfrostServerError = {
      name: "BlockfrostServerError",
      status_code: 404,
      error: "NotFound",
    };
    expect(Types.isBlockfrostServerError(notFound)).toBeTruthy();
  });
});

describe("isError", () => {
  it("can recognize an error", ({ expect }) => {
    const serverError: Types.BlockfrostServerError = {
      name: "BlockfrostServerError",
      status_code: 404,
      error: "NotFound",
    };
    const clientError: Types.BlockfrostClientError = {
      name: "BlockfrostClientError",
      status_code: 404,
      message: "Unprecedented error!",
    };
    const apiError: Types.APIError = {
      name: "APIError",
      status: 404,
      type: "not_found",
      message: "The requested item could not be found",
      timestamp: "2021-02-19T08:52:25.000Z",
      path: "/api/v0/assets/123asdeasd12443q",
    };
    expect(Types.isError(serverError)).toBeTruthy();
    expect(Types.isError(clientError)).toBeTruthy();
    expect(Types.isError(apiError)).toBeTruthy();
  });

  it("can handle null and undefined", ({ expect }) => {
    expect(Types.isError(undefined)).toBeFalsy();
    expect(Types.isError(null)).toBeFalsy();
  });
});

describe("isBlock", () => {
  it("can recognize a block", ({ expect }) => {
    const block: Types.Block = {
      time: 0,
      height: 0,
      hash: "string",
      slot: 0,
      epoch: 0,
      epoch_slot: 0,
      slot_leader: "string",
      size: 0,
      tx_count: 0,
      output: "string",
      fees: "string",
      block_vrf: "string",
      op_cert: "string",
      op_cert_counter: "0",
      previous_block: "string",
      next_block: "string",
      confirmations: 0,
    };
    expect(Types.isBlock(block)).toBeTruthy();
  });

  it("can handle null and undefined", ({ expect }) => {
    expect(Types.isBlock(undefined)).toBeFalsy();
    expect(Types.isBlock(null)).toBeFalsy();
  });
});

describe("isHealth", () => {
  it("can recognize health", ({ expect }) => {
    const health: Types.Health = {
      is_healthy: true,
    };
    expect(Types.isHealth(health)).toBeTruthy();
  });

  it("can handle null and undefined", ({ expect }) => {
    expect(Types.isHealth(undefined)).toBeFalsy();
    expect(Types.isHealth(null)).toBeFalsy();
  });
});

describe("isTransaction", () => {
  it("can recognize a transaction", ({ expect }) => {
    // Since we only check types we don't bother to make it realistic
    const tx: Types.Transaction = {
      hash: "string",
      block: "string",
      block_height: 1,
      block_time: 1,
      slot: 1,
      index: 1,
      output_amount: [],
      fees: "string",
      deposit: "string",
      size: 0,
      invalid_before: null,
      invalid_hereafter: null,
      utxo_count: 0,
      withdrawal_count: 0,
      mir_cert_count: 0,
      delegation_count: 0,
      stake_cert_count: 0,
      pool_update_count: 0,
      pool_retire_count: 0,
      asset_mint_or_burn_count: 0,
      redeemer_count: 0,
      valid_contract: true,
    };
    expect(Types.isTransaction(tx)).toBeTruthy();
  });

  it("can handle null and undefined", ({ expect }) => {
    expect(Types.isTransaction(undefined)).toBeFalsy();
    expect(Types.isTransaction(null)).toBeFalsy();
  });
});

describe("isAsset", () => {
  it("can recognize an asset", ({ expect }) => {
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

    Types.assetSchema.parse(asset);

    expect(Types.isAsset(asset)).toBeTruthy();
  });

  it("can handle realworld examples", ({ expect }) => {
    expect(Types.isAsset(nutcoin_tx)).toBeTruthy();
    expect(Types.isAsset(clumsy_valley_tx)).toBeTruthy();
    expect(Types.isAsset(jelly_cube_tx)).toBeTruthy();
  });

  it("can handle null and undefined", ({ expect }) => {
    expect(Types.isAsset(undefined)).toBeFalsy();
    expect(Types.isAsset(null)).toBeFalsy();
  });
});

// nutcoin
const nutcoin_tx = {
  asset:
    "b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a76e7574636f696e",
  policy_id: "b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a7",
  asset_name: "6e7574636f696e",
  fingerprint: "asset1pkpwyknlvul7az0xx8czhl60pyel45rpje4z8w",
  quantity: "12000",
  initial_mint_tx_hash:
    "6804edf9712d2b619edb6ac86861fe93a730693183a262b165fcc1ba1bc99cad",
  mint_or_burn_count: 1,
  onchain_metadata: {},
  onchain_metadata_standard: "CIP25v1",
  onchain_metadata_extra: "string",
  metadata: {
    name: "nutcoin",
    description: "The Nut Coin",
    ticker: "nutc",
    url: "https://www.stakenuts.com/",
    logo: "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",
    decimals: 6,
  },
};

// Clumsy Valley Example Asset
const clumsy_valley_tx = {
  asset:
    "b00041d7dc086d33e0f7777c4fccaf3ef06720543d4ff4e750d8f123436c756d73792056616c6c6579204c616e6420506c6f74202337393538",
  policy_id: "b00041d7dc086d33e0f7777c4fccaf3ef06720543d4ff4e750d8f123",
  asset_name: "436c756d73792056616c6c6579204c616e6420506c6f74202337393538",
  fingerprint: "asset12jc5yhcftnsndzqlf0sdz592wuyly053zahgg8",
  quantity: "1",
  initial_mint_tx_hash:
    "a48383c4e023000eb6cbd6e3a877afc76c659ba9374d5bc8926654b6b0fc0711",
  mint_or_burn_count: 1,
  onchain_metadata: {
    id: "7958",
    rank: "9438",
    biome: "toxic-swamps",
    grass: "5",
    image: [
      "bafybeif37umi6d5ww3vhski26wcnjkvg7esm5gxsnmzatfo56mklklrtme/",
      "final/",
      "ClumsyValleyLandPlot7958_ipfs.svg",
    ],
    items: "7",
    stone: "1",
    project: "Clumsy Valley",
    special: "no",
    terrain: "swamp1",
    lily_pad: "1",
    mediaType: "image/svg+xml",
    side_terrain: "musty",
  },
  onchain_metadata_standard: null,
  onchain_metadata_extra: null,
  metadata: null,
};

// Jelly Cube
const jelly_cube_tx = {
  asset:
    "3ee441f40fe395a2e98eea1df7cf8816b0fca3d5d164893596ce306d4a656c6c7963756265202332313339",
  policy_id: "3ee441f40fe395a2e98eea1df7cf8816b0fca3d5d164893596ce306d",
  asset_name: "4a656c6c7963756265202332313339",
  fingerprint: "asset1drze99p9xp2k4h3gw7s0p8rdukjlfgdn837y9p",
  quantity: "1",
  initial_mint_tx_hash:
    "8f95949540040f75a752b29f175caa7c41dbd8b95040cea4044ae775b528ecb3",
  mint_or_burn_count: 3,
  onchain_metadata: {
    Face: "Perfect",
    Main: "Backpack",
    name: "Yanto of Jellyiet",
    Block: "Jellyiet",
    Class: "Monk",
    image: ["ipfs://Qmd6zijQK7tCYxgWa6S172iCP48V7hMzAaPhgRikZG8nKo"],
    Filler: "Jewellery",
    Points: 1,
    Wisdom: 5,
    LeftTop: "Foodie",
    Twitter: "https://twitter.com/the_Block_Group",
    Website: "https://blockinvestmentgroup.com",
    project: "Jellycubes",
    Charisma: 5,
    RightTop: "Joku",
    Strength: 1,
    Dexterity: 1,
    Intellect: 1,
    Secondary: "Elaric's Blunder Gun",
    Backgrounds: "Purple",
    Description: [
      "Jellycubes are your ticket into",
      " the Exclusive Block Investment Group",
      " - an Alpha Group that provides members with the Information,",
      " Tools, and Networking to succeed in the Crypto & NFT Space.",
    ],
    "Combat Score": 18,
    Constitution: 5,
  },
  onchain_metadata_standard: "CIP25v1",
  onchain_metadata_extra: null,
  metadata: null,
};
