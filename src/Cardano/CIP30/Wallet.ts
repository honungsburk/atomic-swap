import type {
  TransactionWitnessSet,
  TransactionUnspentOutput,
  Value,
  BaseAddress,
  RewardAddress,
  Transaction,
  Address,
} from "@emurgo/cardano-serialization-lib-browser";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";
import * as CIP30API from "./API";

import { Buffer } from "buffer";

export type NetworkID = "Mainnet" | "Testnet";

export type BasicWallet = Wallet<any, undefined>;

export function buildBasicWallet(
  initAPI: CIP30API.CIP30InitalAPI<any>,
  fullAPI: CIP30API.Cip30EnabledAPI<any>,
  lib: typeof CardanoSerializationLib
): BasicWallet {
  return new Wallet(initAPI, fullAPI, () => undefined, lib);
}

/**
 * A thin wrapper around a Cardano WalletConnectorRaw API to give it more
 * convenient types
 *
 */
export class Wallet<T, W> {
  private initAPI: CIP30API.CIP30InitalAPI<T>;
  private enabledAPI: CIP30API.Cip30EnabledAPI<T>;
  private _experimental: W;
  private lib: typeof CardanoSerializationLib;

  constructor(
    initAPI: CIP30API.CIP30InitalAPI<T>,
    enabledAPI: CIP30API.Cip30EnabledAPI<T>,
    experimentalWrapperBulider: (ex: T) => W,
    lib: typeof CardanoSerializationLib
  ) {
    this.lib = lib;
    this.initAPI = initAPI;
    this.enabledAPI = enabledAPI;
    this._experimental = experimentalWrapperBulider(enabledAPI.experimental);
  }

  experimental(): W {
    return this._experimental;
  }

  apiVersion(): string {
    return this.initAPI.apiVersion;
  }

  name(): string {
    return this.initAPI.name;
  }

  icon(): string {
    return this.initAPI.icon;
  }

  /**
   * Will ask the user to give access to requested website. If access is given, this function will return true,
   * otherwise throws an error. If the user calls this function again with already having permission to the
   * requested website, it will simply return true.
   *
   * Errors: APIError | UnknownError
   *
   * @returns a Cip30FullAPI
   */
  async enable(): Promise<CIP30API.Cip30EnabledAPI<T>> {
    return this.enabledAPI;
  }

  /**
   * Returns true if wallet has access to requested website, false otherwise.
   *
   * Errors: APIError | UnknownError
   *
   * @returns a boolean
   */
  async isEnabled(): Promise<boolean> {
    try {
      const val = await this.initAPI.isEnabled();
      return val;
    } catch (err: any) {
      throw toAPIError(err);
    }
  }

  /**
   * Returns 0 if on testnet, otherwise 1 if on mainnet.
   *
   * Errors: APIError | UnknownError
   *
   * @returns
   */
  async getNetworkId(): Promise<NetworkID> {
    try {
      const netID = await this.enabledAPI.getNetworkId();
      return netID === 1 ? "Mainnet" : "Testnet";
    } catch (err: any) {
      throw toAPIError(err);
    }
  }

  /**
   * Errors: APIError | UnknownError
   *
   * Get the total balance of the wallet.
   */
  async getBalance(): Promise<Value> {
    try {
      const valueRaw: CIP30API.ValueRaw = await this.enabledAPI.getBalance();
      const value: Value = this.lib.Value.from_bytes(
        Buffer.from(valueRaw, "hex")
      );
      return value;
    } catch (err: any) {
      throw toAPIError(err);
    }
  }

  /**
   * Amount and paginate are optional parameters.
   * They are meant to filter the overall utxo set of a user's wallet.
   *
   * Errors: UnknownError | APIError | CIP30API.PaginateError
   *
   * @param amount the total value of all the assets all the utxos must be over
   * @param paginate
   */
  async getUtxos(
    amount?: Value,
    paginate?: { page: number; limit: number }
  ): Promise<TransactionUnspentOutput[]> {
    try {
      let amountRaw: CIP30API.ValueRaw | undefined = undefined;
      if (amount) {
        amountRaw = Buffer.from(amount.to_bytes()).toString("hex");
      }
      const utxos: CIP30API.TransactionUnspentOutputRaw[] =
        await this.enabledAPI.getUtxos(amountRaw, paginate);
      const parsedUtxos = utxos.map((utxoRaw) => {
        const utxo: TransactionUnspentOutput =
          this.lib.TransactionUnspentOutput.from_bytes(
            Buffer.from(utxoRaw, "hex")
          );
        return utxo;
      });
      return parsedUtxos;
    } catch (err: any) {
      throw firstTypedErr(toAPIError(err), toPaginateError(err));
    }
  }

  /**
   *
   * Erros: APIError | UnknownError | WalletWrapperError
   *
   * @returns The address to which we should return any change
   */
  async getChangeAddress(): Promise<BaseAddress> {
    try {
      const rawAddress = await this.enabledAPI.getChangeAddress();
      const changeAddress: Address = this.lib.Address.from_bytes(
        Buffer.from(rawAddress, "hex")
      );
      const baseAddress = this.lib.BaseAddress.from_address(changeAddress);

      if (baseAddress !== undefined) {
        return baseAddress;
      }
    } catch (err: any) {
      throw toAPIError(err);
    }

    const err: WalletWrapperError = {
      code: "WalletWrapperError",
      msg: "Could not parse the ChangeAddress into a BaseAddress",
    };

    throw err;
  }

  /**
   * Erros: APIError | UnknownError
   *
   * @returns All address that this wallet has used
   */
  async getUsedAddresses(): Promise<BaseAddress[]> {
    try {
      const usedAddresses = await this.enabledAPI.getUsedAddresses();
      const values = usedAddresses
        .map((rawAddress) => {
          const address: Address = this.lib.Address.from_bytes(
            Buffer.from(rawAddress, "hex")
          );
          return this.lib.BaseAddress.from_address(address);
        })
        .filter((v) => v !== undefined);

      return values as BaseAddress[];
    } catch (err) {
      throw toAPIError(err);
    }
  }

  /**
   * Erros: APIError | UnknownError
   *
   * @returns All address that this wallet has not used
   */
  async getUnusedAddresses(): Promise<BaseAddress[]> {
    try {
      const usedAddresses = await this.enabledAPI.getUnusedAddresses();
      const values = usedAddresses
        .map((rawAddress) => {
          const address: Address = this.lib.Address.from_bytes(
            Buffer.from(rawAddress, "hex")
          );
          return this.lib.BaseAddress.from_address(address);
        })
        .filter((v) => v !== undefined);

      return values as BaseAddress[];
    } catch (err) {
      throw toAPIError(err);
    }
  }

  /**
   *
   * @returns the reward address
   */
  async getRewardAddress(): Promise<RewardAddress> {
    try {
      const rewardAddressRaw = await this.enabledAPI.getRewardAddress();
      const address: Address = this.lib.Address.from_bytes(
        Buffer.from(rewardAddressRaw, "hex")
      );
      const rewardAddress: RewardAddress | undefined =
        this.lib.RewardAddress.from_address(address);

      if (rewardAddress !== undefined) {
        return rewardAddress;
      }
    } catch (err) {
      throw toAPIError(err);
    }

    const err: WalletWrapperError = {
      code: "WalletWrapperError",
      msg: "Could not parse the Reward into a BaseAddress",
    };

    throw err;
  }

  /**
   *
   * @param tx the transaction to be signed
   * @param partialSign weather or not all signatures must be provided by the wallet
   * @returns
   */
  async signTx(
    tx: Transaction,
    partialSign?: boolean
  ): Promise<TransactionWitnessSet> {
    const rawTx: string = Buffer.from(tx.to_bytes()).toString("hex");
    try {
      const txWitnessSetRaw: CIP30API.TransactionWitnessSetRaw =
        await this.enabledAPI.signTx(rawTx, partialSign);
      const txWitnessSet: TransactionWitnessSet =
        this.lib.TransactionWitnessSet.from_bytes(
          Buffer.from(txWitnessSetRaw, "hex")
        );
      return txWitnessSet;
    } catch (err) {
      throw firstTypedErr(toAPIError(err), toSignError(err));
    }
  }

  /**
   *
   * Errors: APIError, TxSendError
   *
   * @param tx the transaction to submit
   * @returns
   */
  async submitTx(tx: Transaction): Promise<CIP30API.hash32> {
    const rawTx: string = Buffer.from(tx.to_bytes()).toString("hex");
    try {
      return await this.enabledAPI.submitTx(rawTx);
    } catch (err) {
      throw firstTypedErr(toAPIError(err), toTxSendError(err));
    }
  }
}

export type WalletWrapperError = { code: "WalletWrapperError"; msg: string };

export type UnknownError = {
  code: "UnknownError";
  err: any;
};

function mkUnknownError(err: any): UnknownError {
  return {
    code: "UnknownError",
    err: err,
  };
}

function isUnknownError(x: any): x is UnknownError {
  return x.code === "UnknownError";
}

function firstTypedErr<A, B>(
  first: A | UnknownError,
  second: B | UnknownError
): A | B | UnknownError {
  if (!isUnknownError(first)) {
    return first;
  }
  if (!isUnknownError(second)) {
    return second;
  }
  return first;
}

/****************** APIError ****************/
export type APIError = {
  code: CIP30API.APIErrorCodeType;
  info: string;
};

export function toAPIError(err: any): APIError | UnknownError {
  if (CIP30API.isApiError(err)) {
    return {
      code: CIP30API.toAPIErrorCodeType(err.code),
      info: err.info,
    };
  } else {
    return mkUnknownError(err);
  }
}

/****************** PaginateError ****************/

function toPaginateError(err: any): CIP30API.PaginateError | UnknownError {
  if (CIP30API.isPaginateError(err)) {
    return err;
  } else {
    return mkUnknownError(err);
  }
}

/****************** DataSignError ****************/

type DataSignError = {
  code: CIP30API.DataSignErrorCodeType;
  info: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toDataSignError(err: any): DataSignError | UnknownError {
  if (CIP30API.isDataSignError(err)) {
    return {
      code: CIP30API.toDataSignErrorCodeType(err.code),
      info: err.info,
    };
  } else {
    return mkUnknownError(err);
  }
}

/****************** TxSendError ****************/

type TxSendError = {
  code: CIP30API.TxSendErrorCodeType;
  info: string;
};

function toTxSendError(err: any): TxSendError | UnknownError {
  if (CIP30API.isTxSendError(err)) {
    return {
      code: err.code === 1 ? "Refused" : "Failure",
      info: err.message !== undefined ? err.message : err.info,
    };
  } else {
    return mkUnknownError(err);
  }
}

/****************** TxSignError ****************/

export type TxSignErrorCode = "ProofGeneration" | "UserDeclined";

export type TxSignError = {
  code: TxSignErrorCode;
  info: string;
};

export function toSignError(err: any): TxSignError | UnknownError {
  if (CIP30API.isTxSendError(err)) {
    return {
      code: err.code === 1 ? "ProofGeneration" : "UserDeclined",
      info: err.info,
    };
  } else {
    return mkUnknownError(err);
  }
}
