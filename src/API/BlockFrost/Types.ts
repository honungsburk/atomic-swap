import * as z from "zod";

////////////////////////////////////////////////////////////////////////////////¨
// Error Types
////////////////////////////////////////////////////////////////////////////////

// API Error

// Our express middleware will throw an APIError if it encounters an error.
export type APIError = {
  name: "APIError";
  status: number;
  type: string;
  message: string;
  timestamp: string;
  path: string;
};

export const apiErrorSchema: z.ZodSchema<APIError> = z.object({
  name: z.literal("APIError"),
  status: z.number(),
  type: z.string(),
  message: z.string(),
  timestamp: z.string(),
  path: z.string(),
});

export function isAPIError(x: any): x is APIError {
  return apiErrorSchema.safeParse(x).success;
}

// Server Error

/**
 * @description BlockfrostServerError is an error that is thrown when the
 * blockfrost server returns an error
 */
export type BlockfrostServerError = {
  name: "BlockfrostServerError";
  status_code: number;
  error: string;
  message?: string;
};

export const blockfrostServerErrorSchema: z.ZodSchema<BlockfrostServerError> =
  z.object({
    name: z.literal("BlockfrostServerError"),
    status_code: z.number(),
    error: z.string(),
    message: z.string().optional(),
  });

export function isBlockfrostServerError(x: any): x is BlockfrostServerError {
  return blockfrostServerErrorSchema.safeParse(x).success;
}

// Client Error

/**
 * @description BlockfrostClientError is an error that is thrown when the
 * blockfrost client running on a lambda functin has an internal erro
 */
export type BlockfrostClientError = {
  name: "BlockfrostClientError";
  status_code: number;
  message?: string;
};

export const blockfrostClientErrorSchema: z.ZodSchema<BlockfrostClientError> =
  z.object({
    name: z.literal("BlockfrostClientError"),
    status_code: z.number(),
    message: z.string().optional(),
  });

export function isBlockfrostClientError(x: any): x is BlockfrostClientError {
  return blockfrostClientErrorSchema.safeParse(x).success;
}

// Errors

export type Error = BlockfrostServerError | BlockfrostClientError | APIError;

export const errorSchema: z.ZodSchema<Error> = z.union([
  blockfrostServerErrorSchema,
  blockfrostClientErrorSchema,
  apiErrorSchema,
]);

export function isError(x: any): x is Error {
  return errorSchema.safeParse(x).success;
}

////////////////////////////////////////////////////////////////////////////////¨
// API Return Types
////////////////////////////////////////////////////////////////////////////////

// Metadata

/**
 * There are two versions of CIP25 metadata. They both represent the exact same
 * data. The only difference is that the policy_id and asset_name are encoded
 * in bytes in CIP25v2 and utf8 in CIP25v1.
 *
 * https://github.com/cardano-foundation/CIPs/tree/master/CIP-0025/cddl
 *
 *
 */

export type FilesDetailsCIP25 = {
  name?: string | null;
  mediaType?: string | null;
  src?: string | string[] | null;
};

export const filesDetailsCIP25Schema: z.ZodSchema<FilesDetailsCIP25> = z.object(
  {
    name: z.string(),
    mediaType: z.string(),
    src: z.union([z.string(), z.array(z.string())]),
  }
);

/*
 * To make our code more robust, we will allow any field to be null or undefined.
 * This is because an asset might be minted with invalid metadata, but we want to be able to show
 * it to the user anyway.
 */
export type MetadataDetailsCIP25 = {
  name?: string | null;
  image?: string | string[] | null;
  mediaType?: string | null;
  description?: string | string[] | null;
  files?: FilesDetailsCIP25[] | null;
};

export const metadataDetailsCIP25Schema: z.ZodSchema<MetadataDetailsCIP25> =
  z.object({
    name: z.string().nullish(),
    image: z.union([z.string(), z.array(z.string())]).nullish(),
    mediaType: z.string().nullish(),
    description: z.union([z.string(), z.array(z.string())]).nullish(),
    files: z.array(filesDetailsCIP25Schema).nullish(),
  });

/**
 * Again, to be a bit more robust, we will allow any field to be null or undefined.
 *
 * spec: https://cips.cardano.org/cips/cip68/
 */
export type FilesDetailsCIP68 = {
  name?: string | null; // utf8
  mediaType?: string | null; // utf8
  src?: string | null; // utf8
};

export const filesDetailsCIP68Schema: z.ZodSchema<FilesDetailsCIP68> = z.object(
  {
    name: z.string().nullish(),
    mediaType: z.string().nullish(),
    src: z.string().nullish(),
  }
);

export type MetadataDetailsCIP68 = {
  name?: string | null; // utf8
  image?: string | null; // utf8
  description?: string | null; // utf8
  files?: FilesDetailsCIP25[] | null;
};

export const metadataDetailsCIP68Schema: z.ZodSchema<MetadataDetailsCIP68> =
  z.object({
    name: z.string().nullish(),
    image: z.string().nullish(),
    description: z.string().nullish(),
    files: z.array(filesDetailsCIP25Schema).nullish(),
  });

// Asset

/**
 * @description If on-chain metadata passes validation, we display the standard
 * under which it is valid
 *
 * @enum {string|null}
 */

// https://blockfrost.dev/api/specific-asset
export type Asset = {
  asset: string; // Hex-encoded asset full name
  policy_id: string; // is text in cip25-1, bytes in cip25-2
  // Hex-encoded asset name of the asset
  asset_name: string | null; // is utf8 in cip25-1, bytes in cip25-2
  fingerprint: string;
  quantity: string;
  initial_mint_tx_hash: string;
  mint_or_burn_count: number;
  onchain_metadata?: null | Record<string, unknown>; // either CIP25v1, CIP25v2 or CIP68v1
  // If the metadata is passes validation, we display the standard under which it is valid
  onchain_metadata_standard?: "CIP25v1" | "CIP25v2" | "CIP68v1" | null;
  onchain_metadata_extra?: string | null; // Arbitrary plutus data (CIP68).
  metadata: null | {
    name: string | null;
    description: string | null;
    ticker: string | null;
    url: string | null;
    logo: string | null; // Base64 encoded logo of the asse
    decimals: number | null; // Number of decimal places of the asset unit
  };
};

export const assetSchema: z.ZodSchema<Asset> = z.object({
  asset: z.string(),
  policy_id: z.string(),
  asset_name: z.string().nullable(),
  fingerprint: z.string(),
  quantity: z.string(),
  initial_mint_tx_hash: z.string(),
  mint_or_burn_count: z.number(),
  onchain_metadata: z.any().nullable(),
  onchain_metadata_standard: z.union([
    z.literal("CIP25v1"),
    z.literal("CIP25v2"),
    z.literal("CIP68v1"),
    z.null(),
  ]),
  onchain_metadata_extra: z.string().nullable(),
  metadata: z
    .object({
      name: z.string().nullable(),
      description: z.string().nullable(),
      ticker: z.string().nullable(),
      url: z.string().nullable(),
      logo: z.string().nullable(),
      decimals: z.number().nullable(),
    })
    .nullable(),
});

export function isAsset(x: any): x is Asset {
  return assetSchema.safeParse(x).success;
}

// Health
export type Health = {
  is_healthy: true;
};

export const healthSchema: z.ZodSchema<Health> = z.object({
  is_healthy: z.literal(true),
});

export function isHealth(x: any): x is Health {
  return healthSchema.safeParse(x).success;
}

// Block

export type Block = {
  time: number;
  height: number | null;
  hash: string;
  slot: number | null;
  epoch: number | null;
  epoch_slot: number | null;
  slot_leader: string;
  size: number;
  tx_count: number;
  output: string | null;
  fees: string | null;
  block_vrf: string | null;
  op_cert: string | null;
  op_cert_counter: string | null;
  previous_block: string | null;
  next_block: string | null;
  confirmations: number;
};

export const blockSchema: z.ZodSchema<Block> = z.object({
  time: z.number(),
  height: z.number().nullable(),
  hash: z.string(),
  slot: z.number().nullable(),
  epoch: z.number().nullable(),
  epoch_slot: z.number().nullable(),
  slot_leader: z.string(),
  size: z.number(),
  tx_count: z.number(),
  output: z.string().nullable(),
  fees: z.string().nullable(),
  block_vrf: z.string().nullable(),
  op_cert: z.string().nullable(),
  op_cert_counter: z.string().nullable(),
  previous_block: z.string().nullable(),
  next_block: z.string().nullable(),
  confirmations: z.number(),
});

/**
 *
 * @param x a potential Block
 * @returns
 */
export function isBlock(x: any): x is Block {
  return blockSchema.safeParse(x).success;
}

// ProtocolParameters
// https://blockfrost.dev/api/protocol-parameters
export type ProtocolParameters = {
  epoch: number;
  min_fee_a: number;
  min_fee_b: number;
  max_block_size: number;
  max_tx_size: number;
  max_block_header_size: number;
  key_deposit: string;
  pool_deposit: string;
  e_max: number;
  n_opt: number;
  a0: number;
  rho: number;
  tau: number;
  decentralisation_param: number;
  extra_entropy: string | null;
  protocol_major_ver: number;
  protocol_minor_ver: number;
  min_utxo: string;
  min_pool_cost: string;
  nonce: string;
  cost_models?: any;
  price_mem: number | null;
  price_step: number | null;
  max_tx_ex_mem: string | null;
  max_tx_ex_steps: string | null;
  max_block_ex_mem: string | null;
  max_block_ex_steps: string | null;
  max_val_size: string | null;
  collateral_percent: number | null;
  max_collateral_inputs: number | null;
  coins_per_utxo_word: string | null; // deprecated parameter
  coins_per_utxo_size: string | null; // new parameter in babbage
};

export const protocolParametersSchema: z.ZodSchema<ProtocolParameters> =
  z.object({
    epoch: z.number(),
    min_fee_a: z.number(),
    min_fee_b: z.number(),
    max_block_size: z.number(),
    max_tx_size: z.number(),
    max_block_header_size: z.number(),
    key_deposit: z.string(),
    pool_deposit: z.string(),
    e_max: z.number(),
    n_opt: z.number(),
    a0: z.number(),
    rho: z.number(),
    tau: z.number(),
    decentralisation_param: z.number(),
    extra_entropy: z.string().nullable(),
    protocol_major_ver: z.number(),
    protocol_minor_ver: z.number(),
    min_utxo: z.string(),
    min_pool_cost: z.string(),
    nonce: z.string(),
    cost_models: z.any(),
    price_mem: z.number().nullable(),
    price_step: z.number().nullable(),
    max_tx_ex_mem: z.string().nullable(),
    max_tx_ex_steps: z.string().nullable(),
    max_block_ex_mem: z.string().nullable(),
    max_block_ex_steps: z.string().nullable(),
    max_val_size: z.string().nullable(),
    collateral_percent: z.number().nullable(),
    max_collateral_inputs: z.number().nullable(),
    coins_per_utxo_word: z.string().nullable(), // deprecated parameter
    coins_per_utxo_size: z.string().nullable(), // new parameter in babbage
  });

export function isProtocolParameters(x: any): x is ProtocolParameters {
  return protocolParametersSchema.safeParse(x).success;
}

// Transaction

export type OutputAmount = {
  unit: "lovelace" | string;
  quantity: string;
};

export const outputAmountSchema: z.ZodSchema<OutputAmount> = z.object({
  unit: z.string(),
  quantity: z.string(),
});

export type Transaction = {
  hash: string;
  block: string;
  block_height: number;
  block_time: number;
  slot: number;
  index: number;
  output_amount: OutputAmount[];
  fees: string;
  deposit: string;
  size: number;
  invalid_before: string | null;
  invalid_hereafter: string | null;
  utxo_count: number;
  withdrawal_count: number;
  mir_cert_count: number;
  delegation_count: number;
  stake_cert_count: number;
  pool_update_count: number;
  pool_retire_count: number;
  asset_mint_or_burn_count: number;
  redeemer_count: number;
  valid_contract: boolean;
};

export const transactionSchema: z.ZodSchema<Transaction> = z.object({
  hash: z.string(),
  block: z.string(),
  block_height: z.number(),
  block_time: z.number(),
  slot: z.number(),
  index: z.number(),
  output_amount: z.array(outputAmountSchema),
  fees: z.string(),
  deposit: z.string(),
  size: z.number(),
  invalid_before: z.string().nullable(),
  invalid_hereafter: z.string().nullable(),
  utxo_count: z.number(),
  withdrawal_count: z.number(),
  mir_cert_count: z.number(),
  delegation_count: z.number(),
  stake_cert_count: z.number(),
  pool_update_count: z.number(),
  pool_retire_count: z.number(),
  asset_mint_or_burn_count: z.number(),
  redeemer_count: z.number(),
  valid_contract: z.boolean(),
});

/**
 *
 * @param x a potential transaction
 * @returns
 */
export function isTransaction(x: any): x is Transaction {
  return transactionSchema.safeParse(x).success;
}

////////////////////////////////////////////////////////////////////////////////
// API
////////////////////////////////////////////////////////////////////////////////

export interface API
  extends AssetsAPI,
    BlocksAPI,
    EpochsAPI,
    HealthAPI,
    TransactionAPI {}

export interface AssetsAPI {
  assetsById(unit: string): Promise<Asset | Error>;
}
export interface BlocksAPI {
  blocksLatest(): Promise<Block | Error>;
}
export interface EpochsAPI {
  epochsParameters(epoch: number): Promise<ProtocolParameters | Error>;
}
export interface HealthAPI {
  health(): Promise<Health | Error>;
}
export interface TransactionAPI {
  txs(hash: string): Promise<Transaction | Error>;
}
