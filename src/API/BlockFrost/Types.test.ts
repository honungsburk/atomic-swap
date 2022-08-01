import * as Types from "./Types";
import { expect, test } from "vitest";

test("Types.isBlockfrostServerError - can handle null and undefined", () => {
  expect(Types.isBlockfrostServerError(undefined)).toBeFalsy();
  expect(Types.isBlockfrostServerError(null)).toBeFalsy();
});

test("Types.isBlockfrostServerError - can recognize a BlockfrostServerError", () => {
  const notFound: Types.NotFound = {
    name: "BlockfrostServerError",
    status_code: 404,
    error: "NotFound",
  };
  expect(Types.isBlockfrostServerError(notFound)).toBeTruthy();
});

test("Types.isBlockfrostClientError - can recognize a BlockfrostClientError", () => {
  const notFound: Types.BlockfrostClientError = {
    name: "BlockfrostClientError",
    status_code: 404,
    message: "Unprecedented error!",
  };
  expect(Types.isBlockfrostClientError(notFound)).toBeTruthy();
});

test("Types.isBlockfrostClientError - can handle null and undefined", () => {
  expect(Types.isBlockfrostClientError(undefined)).toBeFalsy();
  expect(Types.isBlockfrostClientError(null)).toBeFalsy();
});

test("Types.isError - can recognize an error", () => {
  const notFound: Types.NotFound = {
    name: "BlockfrostServerError",
    status_code: 404,
    error: "NotFound",
  };
  expect(Types.isError(notFound)).toBeTruthy();
});

test("Types.isError - can handle null and undefined", () => {
  expect(Types.isError(undefined)).toBeFalsy();
  expect(Types.isError(null)).toBeFalsy();
});

test("Types.isAsset - can recognize an asset", () => {
  const asset: Types.Asset = {
    asset: "123asdeasd12443q",
    policy_id: "striasdasdng",
    asset_name: "12asasd",
    fingerprint: "asdasd234sdfsdfsdf",
    quantity: "100",
    initial_mint_tx_hash: "180ysiahbdcih12973ey",
    mint_or_burn_count: 10,
    onchain_metadata: null,
    metadata: null,
  };
  expect(Types.isAsset(asset)).toBeTruthy();
});

test("Types.isAsset - can handle null and undefined", () => {
  expect(Types.isAsset(undefined)).toBeFalsy();
  expect(Types.isAsset(null)).toBeFalsy();
});

test("Types.isAsset - can recognize not an asset", () => {
  const notFound: Types.NotFound = {
    name: "BlockfrostServerError",
    status_code: 404,
    error: "NotFound",
  };
  expect(Types.isAsset(notFound)).toBeFalsy();
});

test("Types.isBlock - can recognize not a block", () => {
  const notFound: Types.NotFound = {
    name: "BlockfrostServerError",
    status_code: 404,
    error: "NotFound",
  };
  expect(Types.isBlock(notFound)).toBeFalsy();
});

test("Types.isBlock - can handle null and undefined", () => {
  expect(Types.isBlock(undefined)).toBeFalsy();
  expect(Types.isBlock(null)).toBeFalsy();
});

test("Types.isHealth - can recognize health", () => {
  const health: Types.Health = {
    is_healthy: true,
  };
  expect(Types.isHealth(health)).toBeTruthy();
});

test("Types.isHealth - can handle null and undefined", () => {
  expect(Types.isHealth(undefined)).toBeFalsy();
  expect(Types.isHealth(null)).toBeFalsy();
});

test("Types.isHealth - can recognize not health", () => {
  const notFound: Types.NotFound = {
    name: "BlockfrostServerError",
    status_code: 404,
    error: "NotFound",
  };
  expect(Types.isHealth(notFound)).toBeFalsy();
});

test("Types.isBlock - can recognize a block", () => {
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
    previous_block: "string",
    next_block: "string",
    confirmations: 0,
  };
  expect(Types.isBlock(block)).toBeTruthy();
});

test("Types.isTransaction - can recognize not a transaction", () => {
  const notFound: Types.NotFound = {
    name: "BlockfrostServerError",
    status_code: 404,
    error: "NotFound",
  };
  expect(Types.isTransaction(notFound)).toBeFalsy();
});

test("Types.isTransaction - can handle null and undefined", () => {
  expect(Types.isTransaction(undefined)).toBeFalsy();
  expect(Types.isTransaction(null)).toBeFalsy();
});

test("Types.isTransaction - can recognize a transaction", () => {
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
