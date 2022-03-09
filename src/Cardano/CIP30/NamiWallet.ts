import { NetworkID } from "./Wallet";
import * as CIP30API from "./API";
import {
  Address,
  BaseAddress,
} from "@emurgo/cardano-serialization-lib-browser";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";
import { Buffer } from "buffer";

export class NamiWallet {
  private namiAPI: CIP30API.NamiAPI;
  private lib: typeof CardanoSerializationLib;

  constructor(namiAPI: CIP30API.NamiAPI, lib: typeof CardanoSerializationLib) {
    this.namiAPI = namiAPI;
    this.lib = lib;
  }

  onNetworkChange(fn: (network: NetworkID) => void): Promise<void> {
    return this.namiAPI.onNetworkChange((netID) =>
      fn(netID === 1 ? "Mainnet" : "Testnet")
    );
  }

  onAccountChange(fn: (network: BaseAddress[]) => void): Promise<void> {
    return this.namiAPI.onAccountChange((addressesRaw) => {
      const addresses = addressesRaw.map((rawAddress: string) => {
        const address: Address = Address.from_bytes(
          Buffer.from(rawAddress, "hex")
        );
        return this.lib.BaseAddress.from_address(address);
      });
      const removeUn = addresses.filter((address) => address !== undefined);
      fn(removeUn as BaseAddress[]);
    });
  }
}
