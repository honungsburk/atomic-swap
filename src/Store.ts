import create from "zustand";
import { BasicWallet } from "cardano-web-bridge-wrapper/lib/BasicWallet";
import * as CIP30 from "cardano-web-bridge-wrapper/lib/CIP30";
import * as Channel from "src/Network/Channel";
import * as ChannelPeerJS from "src/Network/ChannelPeerJS";
import * as P2PSession from "src/Network/Session";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";
import * as TxBuilder from "src/Cardano/TxBuilder";
import { persist } from "zustand/middleware";
import * as Util from "src/Util";

// Wallet
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

// ChannelState
export namespace ChannelState {
  type State = {
    channelState: Channel.ChannelState;
    set: (state: Channel.ChannelState) => void;
  };

  export const use = create<State>((set) => ({
    channelState: "Initalized",
    set: (state) => set({ channelState: state }),
  }));

  // Session.use.getState().session.onChannelState((channelState) => {
  //   console.log("new channel state");
  //   use.setState({ channelState: channelState });
  // });

  // Session.use.subscribe((newSession) => {
  //   console.log("new session");
  //   // inital value
  //   use.setState({ channelState: newSession.session.getChannelState() });
  //   // Listen to changes
  //   newSession.session.onChannelState((channelState) => {
  //     console.log("new channel state");
  //     use.setState({ channelState: channelState });
  //   });
  // });
}

// Session
export namespace Session {
  type State = {
    session: P2PSession.Session;
  };

  function newSession(): P2PSession.Session {
    console.log("newSession");
    //Create
    const newChannel = new ChannelPeerJS.ChannelPeerJS<any>();
    const session = new P2PSession.Session(newChannel, CardanoSerializationLib);

    //Listeners
    ChannelState.use.setState({ channelState: session.getChannelState() });
    session.onChannelState((s) => {
      console.log("ChannelState", s);
      ChannelState.use.setState({ channelState: s });
    });

    //return
    return session;
  }

  export const use = create<State>((set, get) => {
    return {
      session: newSession(),
      newSession: () => {
        get().session.destroy();
        set({ session: newSession() });
      },
    };
  });

  Wallet.use.subscribe(async (state) => {
    if (state.wallet) {
      const session = use.getState().session;
      const networkID = await state.wallet.getNetworkId();
      session.updateMyNetworkID(networkID);

      const myAddress = await state.wallet.getChangeAddress();
      session.updateMyAddress(myAddress.to_address());

      const utxos = await state.wallet.getUtxos();
      session.updateMyUTxOs(utxos);

      const ttlBound = await TxBuilder.createTTLBound(networkID);
      session.updateMyTTLBound(ttlBound);
    }
  });
}

/**
 * Volume is a number in the range [0, 100]
 */
export namespace Volume {
  type State = {
    volume: number;
    set: (volume: number) => void;
  };

  export const use = create(
    persist<State>(
      (set) => ({
        volume: 50,
        set: (volume: number) =>
          set({ volume: Util.Math.clamp(volume, 0, 100) }),
      }),
      {
        name: "zus-volume", // unique name
        getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      }
    )
  );
}

// Last Transaction
