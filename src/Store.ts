import create from "zustand";
import { BasicWallet } from "cardano-web-bridge-wrapper/lib/BasicWallet";
import * as CIP30 from "cardano-web-bridge-wrapper/lib/CIP30";
import * as Channel from "src/Network/Channel";
import * as ChannelPeerJS from "src/Network/ChannelPeerJS";
import * as P2PSession from "src/Network/Session";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";

export namespace Wallet {
  /**
   *
   * @returns a list of all injected cardano wallets
   */
  export function injectedAPIs(): CIP30.InitalAPI<any>[] {
    const walletChoices: CIP30.InitalAPI<any>[] = [];

    for (const property in window.cardano) {
      const api: any = window.cardano[property];
      if (CIP30.isInitalAPI(api)) {
        walletChoices.push(api);
      }
    }

    return walletChoices;
  }

  type State = {
    wallet: undefined | BasicWallet;
    inject: (wallet: BasicWallet) => void;
    deject: () => void;
  };

  export const use = create<State>((set) => ({
    wallet: undefined,
    inject: (wallet: BasicWallet) => set({ wallet: wallet }),
    deject: () => set({ wallet: undefined }),
  }));
}

export namespace Session {
  type State = {
    session: P2PSession.Session;
  };

  function newSession(): P2PSession.Session {
    const newChannel = new ChannelPeerJS.ChannelPeerJS<any>();
    return new P2PSession.Session(newChannel, CardanoSerializationLib);
  }

  export const use = create<State>((set, get) => ({
    session: newSession(),
    newSession: () => {
      get().session.destroy();
      set({ session: newSession() });
    },
  }));

  // React.useEffect(() => {
  //   const update = async () => {
  //     if (wallet !== undefined && session !== undefined) {
  //       const networkID = await wallet.getNetworkId();
  //       session.updateMyNetworkID(networkID);

  //       const myAddress = await wallet.getChangeAddress();
  //       session.updateMyAddress(myAddress.to_address());

  //       const utxos = await wallet.getUtxos();
  //       session.updateMyUTxOs(utxos);
  //     }
  //   };
  //   update();
  // }, [wallet, session]);

  // // TTL Bound Update
  // React.useEffect(() => {
  //   const update = async () => {
  //     if (wallet !== undefined && session !== undefined) {
  //       const networkID = await wallet.getNetworkId();
  //       const ttlBound = await TxBuilder.createTTLBound(networkID);
  //       session.updateMyTTLBound(ttlBound);
  //     }
  //   };
  //   update();
  // }, [wallet, session]);
}

export namespace ChannelState {
  type State = {
    channelState: Channel.ChannelState;
    set: (state: Channel.ChannelState) => void;
  };

  export const use = create<State>((set) => ({
    channelState: "Initalized",
    set: (state) => set({ channelState: state }),
  }));
}
