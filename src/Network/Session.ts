import type {
  Address,
  AssetName,
  BigNum,
  ScriptHash,
  TransactionUnspentOutput,
  TransactionWitnessSet,
  Value,
} from "@emurgo/cardano-serialization-lib-browser";
import * as ValueExtra from "../Cardano/ValueExtra";
import * as Util from "../Util";
import { Channel, ChannelState } from "./Channel";
import * as BigNumExtra from "../Cardano/BigNumExtra";
import * as ListExtra from "../Util/ListExtra";
import * as TTLBound from "./TTLBound";
import Observable from "../Util/Behavior/Observable";
import CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";
import * as Extra from "../Util/Extra";
import { NetworkID } from "cardano-web-bridge-wrapper";

export class Session {
  private lib: typeof CardanoSerializationLib;

  // Sync
  private theirState: SharedFullState;
  private channel: Channel<Msg>;
  private observable: Observable<Listener>;

  // State
  private fullState: FullState;
  private fullChatState: FullChatState;
  private offer: Offer | undefined;

  constructor(channel: Channel<Msg>, lib: typeof CardanoSerializationLib) {
    this.lib = lib;
    this.fullState = initFullState(this.lib);
    this.theirState = initSharedFullState(this.lib);
    this.fullChatState = initFullChatState();
    this.channel = channel;
    this.observable = new Observable();

    // Whenever there is a message from the client we update the shared state
    channel.onReceive((msg) => {
      if (isStateMsg(msg)) {
        this.updateTheirState(msg.state, msg.bounce);
      } else if (isOfferMsg(msg)) {
        this.updateOnOffer(decodeOffer(this.lib)(msg.offer));
      } else if (isChatMsg(msg)) {
        if (msg.kind === "Voice") {
          this.updateOnVoiceChat(msg);
        } else {
          this.updateOnTextChat(msg);
        }
      }
    });

    channel.onStateChange((newState) => {
      if (newState !== "Connected") {
        // Reset The offer
        this.updateOnOffer(undefined);
        this.updateTheirState(initSharedFullState(this.lib), false);
      } else {
        this.sendSafeState(deriveSharedState(this.fullState));
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Voice Chat
  //////////////////////////////////////////////////////////////////////////////

  sendMyVoiceChatID(id: string): void {
    const newChatState = initChatState();
    newChatState.id = id;
    const msg: ChatMsg = {
      type: "Chat",
      kind: "Voice",
      state: newChatState,
    };
    this.channel.sendSafe(msg);
  }

  getTheirVoiceChatID(): string | null {
    return this.fullChatState.theirAudio.id;
  }

  onTheirVoiceChatID(fn: (id: string) => void): () => void {
    return this.observable.addObserver({
      kind: "TheirVoiceChatIDListener",
      fn: fn,
    });
  }

  private updateOnVoiceChat(msg: ChatMsg): void {
    // Only trigger on changes
    if (this.fullChatState.theirAudio.id !== msg.state.id) {
      this.fullChatState.theirAudio.id = msg.state.id;
      this.observable.forEachObserver((ob) => {
        if (ob.kind === "TheirVoiceChatIDListener" && msg.state.id !== null) {
          ob.fn(msg.state.id);
        }
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Text Chat
  //////////////////////////////////////////////////////////////////////////////

  sendMyTextChatID(id: string): void {
    const newChatState = initChatState();
    newChatState.id = id;
    const msg: ChatMsg = {
      type: "Chat",
      kind: "Text",
      state: newChatState,
    };
    this.channel.sendSafe(msg);
  }

  getTheirTextChatID(): string | null {
    return this.fullChatState.theirText.id;
  }

  onTheirTextChatID(fn: (id: string) => void): () => void {
    return this.observable.addObserver({
      kind: "TheirTextChatIDListener",
      fn: fn,
    });
  }

  private updateOnTextChat(msg: ChatMsg): void {
    // Only trigger on changes
    if (this.fullChatState.theirText.id !== msg.state.id) {
      this.fullChatState.theirText.id = msg.state.id;
      this.observable.forEachObserver((ob) => {
        if (ob.kind === "TheirTextChatIDListener" && msg.state.id !== null) {
          ob.fn(msg.state.id);
        }
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Life Cycle
  //////////////////////////////////////////////////////////////////////////////

  /**
   *
   * @param peerID the ID of the peer to connect to
   */
  connectTo(peerID: string): void {
    this.channel.connectTo(peerID);
  }

  /**
   * return the id with which you can connect to id
   */
  getID(): string {
    return this.channel.getID();
  }

  /**
   * Destroy the connection
   */
  destroy(): void {
    if (this.channel) {
      this.channel.destroy();
    }
    this.observable.deleteAllObservers();
  }

  updateTheirState(theirState: SharedFullState, bounce: boolean): void {
    this.theirState = theirState;
    const copy = copyFullState(this.lib)(this.fullState);

    copy.theirViewOfTheirOffer = deriveTxState(this.lib)(theirState.theirState);
    copy.theirViewOfMyOffer = deriveTxState(this.lib)(theirState.myState);

    if (copy.myOffer.locked) {
      copy.theirOffer.locked = copy.theirViewOfMyOffer.locked;
    } else {
      copy.theirOffer = copyTxState(this.lib)(copy.theirViewOfMyOffer);
    }

    this.updateOnState(copy);
    if (bounce) {
      this.sendSafeState(deriveSharedState(this.fullState), false);
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Offer
  //////////////////////////////////////////////////////////////////////////////

  createOffer(txWitnessSet: TransactionWitnessSet): void {
    const id = Util.makeID(30);
    const myOfferView: Offer = {
      kind: "TheyArePending",
      id: id,
      witness: txWitnessSet,
    };
    const theirOfferView: Offer = {
      kind: "IAmPending",
      id: id,
      witness: txWitnessSet,
    };
    this.updateOnOffer(myOfferView);
    this.sendSafeOffer(theirOfferView);
  }

  acceptOffer(txID: string): void {
    if (this.offer?.kind === "IAmPending") {
      const offerAccept: OfferAccept = {
        kind: "OfferAccept",
        id: this.offer.id,
        txID: txID,
      };
      this.sendSafeOffer(offerAccept);
      this.updateOnOffer(offerAccept);
    }
  }

  resetOffer(): void {
    this.updateOnOffer(undefined);
  }

  rejectOffer(): void {
    this.updateOnOffer(undefined);
    const rejectOfferAction: OfferReject = {
      kind: "OfferReject",
    };
    this.sendSafeOffer(rejectOfferAction);
  }

  onOffer(callBack: (action: Offer | undefined) => void): () => void {
    return this.observable.addObserver({ kind: "OfferListener", fn: callBack });
  }

  ////////////////////////////////////////////////////////////////////////////////
  // ChannelState
  ////////////////////////////////////////////////////////////////////////////////

  onChannelState(
    callBack: (state: ChannelState, previous: ChannelState) => void
  ): () => void {
    return this.channel.onStateChange(callBack);
  }

  getChannelState(): ChannelState {
    return this.channel.getState();
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Error
  ////////////////////////////////////////////////////////////////////////////////

  onError(callBack: (err: any) => void): () => void {
    return this.channel.onError(callBack);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // My Value
  ////////////////////////////////////////////////////////////////////////////////

  onMyValue(callBack: (value: Value, previous: Value) => void): () => void {
    return this.observable.addObserver({
      kind: "MyValueListener",
      fn: callBack,
    });
  }

  getMyValue(): Value {
    return this.fullState.myOffer.value;
  }

  private updateOnMyValue(value: Value) {
    if (!ValueExtra.eq(this.fullState.myOffer.value, value)) {
      const oldValue = this.fullState.myOffer.value;
      this.fullState.myOffer.value = value;
      this.observable.forEachObserver((listener) => {
        if (listener.kind === "MyValueListener") {
          listener.fn(value, oldValue);
        }
      });
    }
    this.updateOnMissMatchErrors(this.fullState);
  }

  updateMyADA(myAda: BigNum): void {
    if (this.fullState.myOffer.locked) {
      return;
    }
    const copy = ValueExtra.copy(this.lib)(this.fullState.myOffer.value);
    copy.set_coin(myAda);
    this.updateOnMyValue(copy);
    this.sendSafeState(deriveSharedState(this.fullState));
  }

  removeMyAsset(hash: ScriptHash, assetName: AssetName): void {
    if (this.fullState.myOffer.locked) {
      return;
    }
    const newValue = ValueExtra.removeAsset(this.lib)(
      this.fullState.myOffer.value,
      hash,
      assetName
    );
    this.updateOnMyValue(newValue);
    this.sendSafeState(deriveSharedState(this.fullState));
  }

  addMyAsset(hash: ScriptHash, assetName: AssetName, amount: BigNum): void {
    if (this.fullState.myOffer.locked) {
      return;
    }
    const newValue = ValueExtra.addAsset(this.lib)(
      this.fullState.myOffer.value,
      hash,
      assetName,
      amount
    );
    this.updateOnMyValue(newValue);
    this.sendSafeState(deriveSharedState(this.fullState));
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Their Value
  ////////////////////////////////////////////////////////////////////////////////

  onTheirValue(callBack: (value: Value, previous: Value) => void): () => void {
    return this.observable.addObserver({
      kind: "TheirValueListener",
      fn: callBack,
    });
  }

  getTheirValue(): Value {
    return this.fullState.theirOffer.value;
  }

  private updateOnTheirValue(value: Value) {
    if (!ValueExtra.eq(this.fullState.theirOffer.value, value)) {
      const oldValue = this.fullState.theirOffer.value;
      this.fullState.theirOffer.value = value;
      this.observable.forEachObserver((listener) => {
        if (listener.kind === "TheirValueListener") {
          listener.fn(value, oldValue);
        }
      });
      this.updateOnMissMatchErrors(this.fullState);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  // My NetworkID
  ////////////////////////////////////////////////////////////////////////////////

  getMyNetworkID(): NetworkID | null {
    return this.fullState.myOffer.networkID;
  }

  onMyNetworkID(
    callBack: (current: NetworkID | null, previous: NetworkID | null) => void
  ): () => void {
    return this.observable.addObserver({
      kind: "MyNetworkIDListener",
      fn: callBack,
    });
  }

  private updateOnMyNetworkID(networkID: NetworkID | null) {
    if (this.fullState.myOffer.networkID !== networkID) {
      const oldNetworkID = this.fullState.myOffer.networkID;
      this.fullState.myOffer.networkID = networkID;
      this.observable.forEachObserver((listener) => {
        if (listener.kind === "MyNetworkIDListener") {
          listener.fn(networkID, oldNetworkID);
        }
      });
    }
  }

  updateMyNetworkID(networkID: NetworkID): void {
    if (this.fullState.myOffer.locked) {
      return;
    }
    this.updateOnMyNetworkID(networkID);
    this.sendSafeState(deriveSharedState(this.fullState));
    this.updateOnMissMatchErrors(this.fullState);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Their NetworkID
  ////////////////////////////////////////////////////////////////////////////////

  getTheirNetworkID(): NetworkID | null {
    return this.fullState.theirOffer.networkID;
  }

  onTheirNetworkID(
    callBack: (current: NetworkID | null, previous: NetworkID | null) => void
  ): () => void {
    return this.observable.addObserver({
      kind: "TheirNetworkIDListener",
      fn: callBack,
    });
  }

  private updateOnTheirNetworkID(networkID: NetworkID | null) {
    // By some mechanism we get nulls here and I don't know how...
    if (this.fullState.theirOffer.networkID !== networkID) {
      const oldNetworkID = this.fullState.theirOffer.networkID;
      this.fullState.theirOffer.networkID = networkID;
      this.observable.forEachObserver((listener) => {
        if (listener.kind === "TheirNetworkIDListener") {
          listener.fn(networkID, oldNetworkID);
        }
      });
    }
    this.updateOnMissMatchErrors(this.fullState);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // My Lock
  ////////////////////////////////////////////////////////////////////////////////

  getMyLock(): boolean {
    return this.fullState.myOffer.locked;
  }

  onMyLock(
    callBack: (current: boolean, previous: boolean) => void
  ): () => void {
    return this.observable.addObserver({
      kind: "MyLockListener",
      fn: callBack,
    });
  }

  private updateOnMyLock(lock: boolean) {
    if (this.fullState.myOffer.locked !== lock) {
      const oldLock = this.fullState.myOffer.locked;
      this.fullState.myOffer.locked = lock;
      this.observable.forEachObserver((listener) => {
        if (listener.kind === "MyLockListener") {
          listener.fn(lock, oldLock);
        }
      });
    }
  }

  updateMyLock(lock: boolean): void {
    this.updateOnMyLock(lock);
    this.sendSafeState(deriveSharedState(this.fullState));

    if (!lock) {
      const newtheirOffer = deriveTxState(this.lib)(this.theirState.myState);
      this.updateOnTheirLock(newtheirOffer.locked);
      this.updateOnTheirNetworkID(newtheirOffer.networkID);
      this.updateOnTheirValue(newtheirOffer.value);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Their Lock
  ////////////////////////////////////////////////////////////////////////////////

  getTheirLock(): boolean {
    return this.fullState.theirOffer.locked;
  }

  onTheirLock(
    callBack: (current: boolean, previous: boolean) => void
  ): () => void {
    return this.observable.addObserver({
      kind: "TheirLockListener",
      fn: callBack,
    });
  }

  private updateOnTheirLock(lock: boolean) {
    if (this.fullState.theirOffer.locked !== lock) {
      const oldLock = this.fullState.theirOffer.locked;
      this.fullState.theirOffer.locked = lock;
      this.observable.forEachObserver((listener) => {
        if (listener.kind === "TheirLockListener") {
          listener.fn(lock, oldLock);
        }
      });
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  // OnState
  ////////////////////////////////////////////////////////////////////////////////

  private updateOnState(fullState: FullState) {
    this.updateOnMyLock(fullState.myOffer.locked);
    this.updateOnMyNetworkID(fullState.myOffer.networkID);
    this.updateOnMyValue(fullState.myOffer.value);
    this.updateOnMyAddress(fullState.myOffer.address);

    this.updateOnTheirLock(fullState.theirOffer.locked);
    this.updateOnTheirNetworkID(fullState.theirOffer.networkID);
    this.updateOnTheirValue(fullState.theirOffer.value);
    this.updateOnTheirAddress(fullState.theirOffer.address);

    this.fullState = fullState;
    this.updateOnMissMatchErrors(this.fullState);
  }

  getState(): FullState {
    return copyFullState(this.lib)(this.fullState);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Offer
  ////////////////////////////////////////////////////////////////////////////////

  getOffer(): Offer | undefined {
    return this.offer;
  }

  private updateOnOffer(offer: Offer | undefined) {
    this.offer = offer;
    this.observable.forEachObserver((listener) => {
      if (listener.kind === "OfferListener") {
        listener.fn(offer);
        if (offer?.kind === "OfferAccept") {
          // Reset The offer
          this.updateOnOffer(undefined);
          this.theirState = initSharedFullState(this.lib);
          const newFullState = initFullState(this.lib);
          newFullState.myOffer.address = this.fullState.myOffer.address;
          newFullState.myOffer.networkID = this.fullState.myOffer.networkID;
          this.updateOnState(newFullState);
        }
      }
    });
    this.updateOnMissMatchErrors(this.fullState);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // TTL
  ////////////////////////////////////////////////////////////////////////////////

  getNegotiatedTTL(): number {
    return TTLBound.maxTTL(
      this.fullState.myOffer.ttl,
      this.fullState.theirOffer.ttl
    );
  }

  updateMyTTLBound(ttlBound: TTLBound.TTLBound): void {
    if (this.fullState.myOffer.locked) {
      return;
    }
    this.fullState.myOffer.ttl = TTLBound.copy(ttlBound);
    this.sendSafeState(deriveSharedState(this.fullState));
    this.updateOnMissMatchErrors(this.fullState);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // My Address
  ////////////////////////////////////////////////////////////////////////////////

  updateMyAddress(address: Address | null): void {
    if (this.fullState.myOffer.locked) {
      return;
    }
    this.updateOnMyAddress(address);
    this.sendSafeState(deriveSharedState(this.fullState));
    this.updateOnMissMatchErrors(this.fullState);
  }

  getMyAddress(): Address | null {
    return this.fullState.myOffer.address;
  }

  private updateOnMyAddress(address: Address | null) {
    if (
      this.fullState.myOffer.address?.to_bech32("addr") !==
      address?.to_bech32("addr")
    ) {
      this.fullState.myOffer.address = address;
      this.observable.forEachObserver((listener) => {
        if (listener.kind === "MyAddressListener") {
          listener.fn(address);
        }
      });
      this.updateOnMissMatchErrors(this.fullState);
    }
  }

  onMyAddress(callBack: (current: Address | null) => void): () => void {
    return this.observable.addObserver({
      kind: "MyAddressListener",
      fn: callBack,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Their Address
  ////////////////////////////////////////////////////////////////////////////////

  getTheirAddress(): Address | null {
    return this.fullState.theirOffer.address;
  }

  private updateOnTheirAddress(address: Address | null) {
    if (
      this.fullState.theirOffer.address?.to_bech32("addr") !==
      address?.to_bech32("addr")
    ) {
      this.fullState.theirOffer.address = address;
      this.observable.forEachObserver((listener) => {
        if (listener.kind === "TheirAddressListener") {
          listener.fn(address);
        }
      });
      this.updateOnMissMatchErrors(this.fullState);
    }
  }

  onTheirAddress(callBack: (current: Address | null) => void): () => void {
    return this.observable.addObserver({
      kind: "TheirAddressListener",
      fn: callBack,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  // UTxOs
  ////////////////////////////////////////////////////////////////////////////////

  getMyUtxos(): TransactionUnspentOutput[] {
    return [...this.fullState.myOffer.utxos];
  }

  getTheirUtxos(): TransactionUnspentOutput[] {
    return [...this.fullState.theirOffer.utxos];
  }

  updateMyUTxOs(utxos: TransactionUnspentOutput[]): void {
    if (this.fullState.myOffer.locked) {
      return;
    }
    this.fullState.myOffer.utxos = [...utxos];
    this.sendSafeState(deriveSharedState(this.fullState));
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Sending
  ////////////////////////////////////////////////////////////////////////////////

  private sendSafeState(state: SharedFullState, bounce = true): void {
    this.channel.sendSafe({ type: "State", state: state, bounce: bounce });
  }

  private sendSafeOffer(offer: Offer): void {
    this.channel.sendSafe({ type: "Offer", offer: encodeOffer(offer) });
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Sending
  ////////////////////////////////////////////////////////////////////////////////

  getMissMatchErrors(): TradeMissMatch[] {
    return tradeMissMatch(this.fullState);
  }

  onMissMatchErrors(callBack: (current: TradeMissMatch[]) => void): () => void {
    return this.observable.addObserver({
      kind: "TradeMissMatchErrors",
      fn: callBack,
    });
  }

  private updateOnMissMatchErrors(fullState: FullState) {
    const errors = tradeMissMatch(fullState);
    this.observable.forEachObserver((listener) => {
      if (listener.kind === "TradeMissMatchErrors") {
        listener.fn(errors);
      }
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// Messages
////////////////////////////////////////////////////////////////////////////////

type Msg = StateMsg | OfferMsg | ChatMsg;

function isStateMsg(x: any): x is StateMsg {
  return x.type === "State";
}

type StateMsg = { type: "State"; state: SharedFullState; bounce: boolean };

function isOfferMsg(x: any): x is OfferMsg {
  return x.type === "Offer";
}

type OfferMsg = { type: "Offer"; offer: OfferRaw };

function isChatMsg(x: any): x is ChatMsg {
  return x.type === "Chat";
}

type ChatMsg = { type: "Chat"; kind: "Voice" | "Text"; state: ChatState };

////////////////////////////////////////////////////////////////////////////////
// Offer
////////////////////////////////////////////////////////////////////////////////

export type OfferRaw = OfferAccept | OfferPendingRaw | OfferReject;

export type Offer = OfferAccept | OfferPending | OfferReject;

type OfferAccept = {
  kind: "OfferAccept";
  id: string;
  txID: string;
};

type OfferReject = {
  kind: "OfferReject";
};

type OfferPendingRaw = {
  kind: "IAmPending" | "TheyArePending";
  id: string;
  witness: string;
};

type OfferPending = {
  kind: "IAmPending" | "TheyArePending";
  id: string;
  witness: TransactionWitnessSet;
};

function encodeOffer(offer: Offer): OfferRaw {
  switch (offer.kind) {
    case "IAmPending":
      return {
        kind: "IAmPending",
        id: offer.id,
        witness: encodeWitness(offer.witness),
      };
    case "TheyArePending":
      return {
        kind: "TheyArePending",
        id: offer.id,
        witness: encodeWitness(offer.witness),
      };
    case "OfferReject":
      return offer;
    case "OfferAccept":
      return offer;
  }
}

const decodeOffer: (
  lib: typeof CardanoSerializationLib
) => (offer: OfferRaw) => Offer = (lib) => (offer: OfferRaw) => {
  switch (offer.kind) {
    case "IAmPending":
      return {
        kind: "IAmPending",
        id: offer.id,
        witness: decodeWitness(lib)(offer.witness),
      };
    case "TheyArePending":
      return {
        kind: "TheyArePending",
        id: offer.id,
        witness: decodeWitness(lib)(offer.witness),
      };
    case "OfferReject":
      return offer;
    case "OfferAccept":
      return offer;
  }
};

////////////////////////////////////////////////////////////////////////////////
// PrivateState
////////////////////////////////////////////////////////////////////////////////

export type FullState = {
  myOffer: TxState;
  theirOffer: TxState;
  theirViewOfTheirOffer: TxState;
  theirViewOfMyOffer: TxState;
};

export type FullChatState = {
  theirAudio: ChatState;
  theirText: ChatState;
};

export function initFullChatState(): FullChatState {
  return {
    theirAudio: initChatState(),
    theirText: initChatState(),
  };
}
export function initChatState(): ChatState {
  return {
    id: null,
  };
}

export type ChatState = {
  id: string | null;
};

export type TxState = {
  networkID: NetworkID | null;
  address: Address | null; // Can be locked
  utxos: TransactionUnspentOutput[]; // Can be locked
  value: Value; // Can be locked
  locked: boolean; // Can not be locked
  ttl: TTLBound.TTLBound;
};

export function initFullState(lib: typeof CardanoSerializationLib): FullState {
  return {
    myOffer: initTxState(lib),
    theirOffer: initTxState(lib),
    theirViewOfTheirOffer: initTxState(lib), // What they see in the GUI
    theirViewOfMyOffer: initTxState(lib), // What they see in the GUI
  };
}

function initTxState(lib: typeof CardanoSerializationLib): TxState {
  return {
    networkID: null,
    address: null,
    utxos: [],
    value: lib.Value.zero(),
    locked: false,
    ttl: TTLBound.initTTL(),
  };
}

////////////////////////////////////////////////////////////////////////////////
// Derive State
////////////////////////////////////////////////////////////////////////////////

const deriveTxState =
  (lib: typeof CardanoSerializationLib) => (state: SharedState) => {
    return {
      networkID: state.networkID,
      locked: state.locked,
      utxos: state.utxos.map(decodeUtxo(lib)),
      address: state.address ? decodeAddress(lib)(state.address) : null,
      value: ValueExtra.decode(lib)(state.value),
      ttl: state.ttl,
    };
  };

function deriveSharedState(newState: FullState): SharedFullState {
  const myState: SharedState = {
    networkID: newState.myOffer.networkID,
    locked: newState.myOffer.locked,
    utxos: newState.myOffer.utxos.map(encodeUtxo),
    address: newState.myOffer.address
      ? encodeAddress(newState.myOffer.address)
      : null,
    value: ValueExtra.encode(newState.myOffer.value),
    ttl: newState.myOffer.ttl,
  };

  const theirState: SharedState = {
    networkID: newState.theirOffer.networkID,
    locked: newState.theirOffer.locked,
    utxos: newState.theirOffer.utxos.map(encodeUtxo),
    address: newState.theirOffer.address
      ? encodeAddress(newState.theirOffer.address)
      : null,
    value: ValueExtra.encode(newState.theirOffer.value),
    ttl: newState.theirOffer.ttl,
  };
  return {
    myState: myState,
    theirState: theirState,
  };
}

const copyFullState =
  (lib: typeof CardanoSerializationLib) => (state: FullState) => {
    return {
      myOffer: copyTxState(lib)(state.myOffer),
      theirOffer: copyTxState(lib)(state.theirOffer),
      theirViewOfTheirOffer: copyTxState(lib)(state.theirViewOfTheirOffer),
      theirViewOfMyOffer: copyTxState(lib)(state.theirViewOfMyOffer),
    };
  };

const copyTxState =
  (lib: typeof CardanoSerializationLib) => (txState: TxState) => {
    return {
      networkID: txState.networkID,
      address: txState.address ? copyAddress(lib)(txState.address) : null,
      locked: txState.locked,
      utxos: txState.utxos.map(copyUtxo(lib)),
      value: ValueExtra.copy(lib)(txState.value),
      ttl: TTLBound.copy(txState.ttl),
    };
  };

const copyAddress =
  (lib: typeof CardanoSerializationLib) => (address: Address) => {
    return decodeAddress(lib)(encodeAddress(address));
  };

const copyUtxo =
  (lib: typeof CardanoSerializationLib) => (utxo: TransactionUnspentOutput) => {
    return decodeUtxo(lib)(encodeUtxo(utxo));
  };

////////////////////////////////////////////////////////////////////////////////
// Shared State
////////////////////////////////////////////////////////////////////////////////

export type SharedFullState = {
  myState: SharedState;
  theirState: SharedState;
};

type SharedState = {
  networkID: NetworkID | null;
  locked: boolean;
  utxos: string[];
  address: string | null;
  value: string;
  ttl: TTLBound.TTLBound;
};

function initSharedFullState(
  lib: typeof CardanoSerializationLib
): SharedFullState {
  return {
    myState: initSharedState(lib),
    theirState: initSharedState(lib),
  };
}

function initSharedState(lib: typeof CardanoSerializationLib): SharedState {
  return {
    networkID: null,
    locked: false,
    utxos: [],
    address: null,
    value: ValueExtra.encode(lib.Value.zero()),
    ttl: { low: 0, high: 0 },
  };
}

////////////////////////////////////////////////////////////////////////////////
// Encoder & Decoder
////////////////////////////////////////////////////////////////////////////////

export function encodeAddress(utxo: Address): string {
  return Extra.toHex(utxo.to_bytes());
}

export const decodeAddress =
  (lib: typeof CardanoSerializationLib) => (value: string) => {
    return lib.Address.from_bytes(Extra.fromHex(value));
  };

export function encodeUtxo(utxo: TransactionUnspentOutput): string {
  return Extra.toHex(utxo.to_bytes());
}

export const decodeUtxo =
  (lib: typeof CardanoSerializationLib) => (value: string) => {
    return lib.TransactionUnspentOutput.from_bytes(Extra.fromHex(value));
  };

export function encodeWitness(witness: TransactionWitnessSet): string {
  return Extra.toHex(witness.to_bytes());
}

export const decodeWitness =
  (lib: typeof CardanoSerializationLib) => (witness: string) => {
    return lib.TransactionWitnessSet.from_bytes(Extra.fromHex(witness));
  };

////////////////////////////////////////////////////////////////////////////////
// TradeMissMatch
////////////////////////////////////////////////////////////////////////////////

export type TradeMissMatchKind =
  | "ADANotMatching"
  | "NativeAssetNotMatching"
  | "AddressNotMatching"
  | "NoAddress"
  | "UtxosNotMatching"
  | "MissingWallet"
  | "MustBeOnSameNetwork";

export type TradeMissMatch = {
  kind: TradeMissMatchKind;
  who: "I" | "Them";
  msg: string;
};

export function tradeMissMatch(fullState: FullState): TradeMissMatch[] {
  const errors: TradeMissMatch[] = [];

  const tips = " (unlock and then lock again to fix.)";

  if (fullState.myOffer.networkID === null) {
    errors.push({
      kind: "MissingWallet",
      who: "I",
      msg: "You must connect your wallet.",
    });
  }

  if (fullState.theirOffer.networkID === null) {
    errors.push({
      kind: "MissingWallet",
      who: "Them",
      msg: "They have not connected their wallet! You must unlock and they must connect their wallet.",
    });
  }

  if (
    fullState.theirOffer.networkID !== fullState.myOffer.networkID ||
    fullState.theirViewOfMyOffer.networkID !== fullState.myOffer.networkID ||
    fullState.theirViewOfMyOffer.networkID !==
      fullState.theirViewOfTheirOffer.networkID
  ) {
    errors.push({
      kind: "MustBeOnSameNetwork",
      who: "I",
      msg: "You must both be on the same network.",
    });
  }

  if (
    !BigNumExtra.eq(
      fullState.myOffer.value.coin(),
      fullState.theirViewOfTheirOffer.value.coin()
    )
  ) {
    errors.push({
      kind: "ADANotMatching",
      who: "I",
      msg: "The ADA under 'You Will Send' is not matching." + tips,
    });
  }

  if (
    !BigNumExtra.eq(
      fullState.theirOffer.value.coin(),
      fullState.theirViewOfMyOffer.value.coin()
    )
  ) {
    errors.push({
      kind: "ADANotMatching",
      who: "Them",
      msg: "The ADA under 'You Will Receive' is not matching." + tips,
    });
  }

  if (
    !ValueExtra.eq(
      fullState.myOffer.value,
      fullState.theirViewOfTheirOffer.value
    )
  ) {
    errors.push({
      kind: "NativeAssetNotMatching",
      who: "I",
      msg: "The native assets under 'You Will Send' is not matching." + tips,
    });
  }

  if (
    !ValueExtra.eq(
      fullState.theirOffer.value,
      fullState.theirViewOfMyOffer.value
    )
  ) {
    errors.push({
      kind: "NativeAssetNotMatching",
      who: "Them",
      msg: "The native assets under 'You Will Receive' is not matching." + tips,
    });
  }

  if (
    fullState.myOffer.address === null ||
    fullState.theirViewOfTheirOffer.address === null
  ) {
    errors.push({
      kind: "NoAddress",
      who: "I",
      msg: "Could not find your address" + tips,
    });
  }

  if (
    fullState.theirOffer.address === null ||
    fullState.theirViewOfMyOffer.address === null
  ) {
    errors.push({
      kind: "NoAddress",
      who: "Them",
      msg: "Could not find their address." + tips,
    });
  }

  if (
    fullState.myOffer.address?.to_bech32("address") !==
    fullState.theirViewOfTheirOffer.address?.to_bech32("address")
  ) {
    errors.push({
      kind: "AddressNotMatching",
      who: "I",
      msg: "Your address is out of sync." + tips,
    });
  }

  if (
    fullState.theirOffer.address?.to_bech32("address") !==
    fullState.theirViewOfMyOffer.address?.to_bech32("address")
  ) {
    errors.push({
      kind: "AddressNotMatching",
      who: "Them",
      msg: "Their address is out of sync." + tips,
    });
  }

  if (
    !ListExtra.eq(
      fullState.myOffer.utxos.map(encodeUtxo),
      fullState.theirViewOfTheirOffer.utxos.map(encodeUtxo)
    )
  ) {
    errors.push({
      kind: "UtxosNotMatching",
      who: "I",
      msg: "Your UTxOs are not synced." + tips,
    });
  }

  if (
    !ListExtra.eq(
      fullState.theirOffer.utxos.map(encodeUtxo),
      fullState.theirViewOfMyOffer.utxos.map(encodeUtxo)
    )
  ) {
    errors.push({
      kind: "UtxosNotMatching",
      who: "Them",
      msg: "Their Utxos are not synced." + tips,
    });
  }

  return errors;
}

////////////////////////////////////////////////////////////////////////////////
// Listerners
////////////////////////////////////////////////////////////////////////////////

type Listener =
  | TheirVoiceChatIDListener
  | TheirTextChatIDListener
  | TheirAddressListener
  | MyAddressListener
  | TradeMissMatchErrorsListener
  | MyLockListener
  | TheirLockListener
  | MyNetworkIDListener
  | TheirNetworkIDListener
  | MyValueListener
  | TheirValueListener
  | ErrorListener
  | OfferListener;

type OfferListener = {
  kind: "OfferListener";
  fn: (offer: Offer | undefined) => void;
};

type TheirValueListener = {
  kind: "TheirValueListener";
  fn: (current: Value, previous: Value) => void;
};

type MyValueListener = {
  kind: "MyValueListener";
  fn: (current: Value, previous: Value) => void;
};

type ErrorListener = {
  kind: "ErrorListener";
  fn: (error: Error) => void;
};

type MyNetworkIDListener = {
  kind: "MyNetworkIDListener";
  fn: (current: NetworkID | null, previous: NetworkID | null) => void;
};

type TheirNetworkIDListener = {
  kind: "TheirNetworkIDListener";
  fn: (current: NetworkID | null, previous: NetworkID | null) => void;
};

type MyLockListener = {
  kind: "MyLockListener";
  fn: (current: boolean, previous: boolean) => void;
};

type TheirLockListener = {
  kind: "TheirLockListener";
  fn: (current: boolean, previous: boolean) => void;
};

type TradeMissMatchErrorsListener = {
  kind: "TradeMissMatchErrors";
  fn: (current: TradeMissMatch[]) => void;
};

type TheirAddressListener = {
  kind: "TheirAddressListener";
  fn: (current: Address | null) => void;
};

type MyAddressListener = {
  kind: "MyAddressListener";
  fn: (current: Address | null) => void;
};

type TheirVoiceChatIDListener = {
  kind: "TheirVoiceChatIDListener";
  fn: (id: string) => void;
};

type TheirTextChatIDListener = {
  kind: "TheirTextChatIDListener";
  fn: (id: string) => void;
};
