// Errors

export type Error =
  | BlockfrostServerError
  | BlockfrostClientError
  | MempoolIsFull
  | BadRequest
  | IPHasBeenBanned
  | InternalServerError
  | MissingOrInvalidAuthSecret
  | NotFound
  | UsageLimitReached;

export type BadRequest = {
  name: "BlockfrostServerError";
  status_code: 400;
  error: string;
  message?: string;
};
export type DailyRequestLimit = {
  name: "BlockfrostServerError";
  status_code: 402;
  error: string;
  message?: string;
};
export type MissingOrInvalidAuthSecret = {
  name: "BlockfrostServerError";
  status_code: 403;
  error: string;
  message?: string;
};
export type NotFound = {
  name: "BlockfrostServerError";
  status_code: 404;
  error: string;
  message?: string;
};
export type IPHasBeenBanned = {
  name: "BlockfrostServerError";
  status_code: 418;
  error: string;
  message?: string;
};
export type MempoolIsFull = {
  name: "BlockfrostServerError";
  status_code: 425;
  error: string;
  message?: string;
};
export type UsageLimitReached = {
  name: "BlockfrostServerError";
  status_code: 429;
  error: string;
  message?: string;
};
export type InternalServerError = {
  name: "BlockfrostServerError";
  status_code: 500;
  error: string;
  message?: string;
};

export type BlockfrostServerError = {
  name: "BlockfrostServerError";
  status_code: number;
  error: string;
  message?: string;
};

export type BlockfrostClientError = {
  name: "BlockfrostClientError";
  status_code: number;
  message?: string;
};

export function isError(x: any): x is Error {
  return x && (isBlockfrostServerError(x) || isBlockfrostClientError(x));
}

export function isBlockfrostServerError(x: any): x is BlockfrostServerError {
  return x && x.name === "BlockfrostServerError";
}

export function isBlockfrostClientError(x: any): x is BlockfrostServerError {
  return x && x.name === "BlockfrostClientError";
}

// Results
export function isAsset(x: any): x is Asset {
  return (
    x &&
    typeof x.asset === "string" &&
    typeof x.policy_id === "string" &&
    typeof x.asset_name === "string" &&
    typeof x.fingerprint === "string"
  );
}

export type Asset = {
  asset: string;
  policy_id: string;
  asset_name: string;
  fingerprint: string;
  quantity: string;
  initial_mint_tx_hash: string;
  mint_or_burn_count: number;
  onchain_metadata: null | {
    name: string | null;
    image: string | null;
    mediaType: string | null;
    description: string | null;
  };
  metadata: null | {
    name: string | null;
    description: string | null;
    ticker: string | null;
    url: string | null;
    logo: string | null;
    decimals: number | null;
  };
};

export function isHealth(x: any): x is Health {
  return x && typeof x.is_healthy === "boolean";
}

export type Health = {
  is_healthy: true;
};

export type Block = {
  time: number;
  height: number;
  hash: string;
  slot: number;
  epoch: number;
  epoch_slot: number;
  slot_leader: string;
  size: number;
  tx_count: number;
  output: string;
  fees: string;
  block_vrf: string;
  previous_block: string;
  next_block: string;
  confirmations: number;
};

/**
 *
 * @param x a potential Block
 * @returns
 */
export function isBlock(x: any): x is Block {
  return (
    x &&
    typeof x.time === "number" &&
    typeof x.height === "number" &&
    typeof x.slot === "number" &&
    typeof x.epoch === "number" &&
    typeof x.hash === "string"
  );
}

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
  extra_entropy: null;
  protocol_major_ver: number;
  protocol_minor_ver: number;
  min_utxo: string;
  min_pool_cost: string;
  nonce: string;
  price_mem: number;
  price_step: number;
  max_tx_ex_mem: string;
  max_tx_ex_steps: string;
  max_block_ex_mem: string;
  max_block_ex_steps: string;
  max_val_size: string;
  collateral_percent: number;
  max_collateral_inputs: number;
  coins_per_utxo_word: string; // deprecated parameter
  coins_per_utxo_size: string; // new parameter in babbage
};

export type OutputAmount = {
  unit: "lovelace" | string;
  quantity: string;
};

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

/**
 *
 * @param x a potential transaction
 * @returns
 */
export function isTransaction(x: any): x is Transaction {
  return (
    x &&
    typeof x.hash === "string" &&
    typeof x.block === "string" &&
    typeof x.block_height === "number" &&
    typeof x.block_time === "number" &&
    typeof x.slot === "number"
  );
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
