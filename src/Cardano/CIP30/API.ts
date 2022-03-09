/****************** Raq CIP30 API ****************/

/**
 * As given by the specs in
 * https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030
 *
 *
 */
export type CardanoWallets = {
  [x: string]: CIP30InitalAPI<any>;
  // nami: CIP30InitalAPI<NamiAPI>
};

/************ Experimental APIs *********/

export type NamiAPI = {
  onAccountChange: (
    arg0: (addresses: [BaseAddressRaw]) => void
  ) => Promise<void>;
  onNetworkChange: (arg0: (network: number) => void) => Promise<void>;
  getCollateral(): TransactionUnspentOutputRaw[];
};

/************ Full API *********/

/**
 * They are all hexencoded bytes strings
 */
export type RewardAddressRaw = string;
export type BaseAddressRaw = string;
export type TransactionRaw = string;
export type hash32 = string;
export type TransactionWitnessSetRaw = string;
export type ValueRaw = string;
export type TransactionUnspentOutputRaw = string;

export type CIP30InitalAPI<T> = {
  enable: () => Promise<Cip30EnabledAPI<T>>;
  isEnabled: () => Promise<boolean>;
  apiVersion: string;
  name: string;
  icon: string;
};

export function isCIP30InitalAPI(x: any): x is CIP30InitalAPI<any> {
  return (
    typeof x.icon === "string" &&
    typeof x.name === "string" &&
    typeof x.apiVersion === "string"
  );
}

export type Cip30EnabledAPI<T> = {
  getBalance: () => Promise<ValueRaw>;
  getUtxos: (
    amount?: ValueRaw,
    paginate?: { page: number; limit: number }
  ) => Promise<TransactionUnspentOutputRaw[]>;
  getNetworkId: () => Promise<number>;
  getRewardAddress: () => Promise<RewardAddressRaw>;
  getChangeAddress: () => Promise<BaseAddressRaw>;
  getUsedAddresses: () => Promise<BaseAddressRaw[]>;
  getUnusedAddresses: () => Promise<BaseAddressRaw[]>;
  signTx: (
    tx: TransactionRaw,
    partialSign?: boolean
  ) => Promise<TransactionWitnessSetRaw>;
  submitTx: (tx: TransactionRaw) => Promise<hash32>;
  experimental: T;
};

/****************** APIError ****************/
export type APIErrorCodeType =
  | "InvalidRequest"
  | "InternalError"
  | "Refused"
  | "AccountChange";
export type APIErrorCode = -1 | -2 | -3 | -4;
export type APIError = {
  code: APIErrorCode;
  info: string;
};

export function isApiError(x: any): x is APIError {
  return x.code === -1 || x.code === -2 || x.code === -3 || x.code === -4;
}

export function toAPIErrorCodeType(code: APIErrorCode): APIErrorCodeType {
  switch (code) {
    case -1:
      return "InvalidRequest";
    case -2:
      return "InternalError";
    case -3:
      return "Refused";
    case -4:
      return "AccountChange";
  }
}

/****************** DataSignError ****************/

export type DataSignErrorCodeType =
  | "ProofGeneration"
  | "AddressNotPK"
  | "UserDeclined"
  | "InvalidFormat";
export type DataSignErrorCode = 1 | 2 | 3 | 4;
export type DataSignError = {
  code: DataSignErrorCode;
  info: string;
};

export function isDataSignError(x: any): x is DataSignError {
  return x.code === 1 || x.code === 2 || x.code === 3 || x.code === 4;
}

export function toDataSignErrorCodeType(
  code: DataSignErrorCode
): DataSignErrorCodeType {
  switch (code) {
    case 1:
      return "ProofGeneration";
    case 2:
      return "AddressNotPK";
    case 3:
      return "UserDeclined";
    case 4:
      return "InvalidFormat";
  }
}

/****************** PaginateError ****************/

export type PaginateError = {
  maxSize: number;
};

export function isPaginateError(x: any): x is PaginateError {
  return typeof x.maxSize === "number";
}

/****************** TxSendError ****************/

export type TxSendErrorCodeType = "Refused" | "Failure";
export type TxSendErrorCode = 1 | 2;
export type TxSendError = {
  code: TxSendErrorCode;
  info: string;
  message?: string; // Nami does this outside of spec
};

export function isTxSendError(x: any): x is TxSendError {
  return x.code === 1 || x.code === 2;
}

export function toTxSendError(code: TxSendErrorCode): TxSendErrorCodeType {
  switch (code) {
    case 1:
      return "Refused";
    case 2:
      return "Failure";
  }
}

/****************** TxSignError ****************/

export type TxSignErrorType = "ProofGeneration" | "UserDeclined";
export type TxSignErrorCode = 1 | 2;
export type TxSignError = {
  code: TxSignErrorCode;
  info: string;
};

export function isTxSignError(x: any): x is TxSignError {
  return x.code === 1 || x.code === 2;
}

export function toTxSignError(code: TxSignErrorCode): TxSignErrorType {
  switch (code) {
    case 1:
      return "ProofGeneration";
    case 2:
      return "UserDeclined";
  }
}
