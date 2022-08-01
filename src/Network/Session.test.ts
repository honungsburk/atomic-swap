import * as Session from "./Session";
import { ChannelPure } from "./ChannelPure";
import * as ValueExtra from "../Cardano/ValueExtra";
import * as TestUtil from "../Cardano/TestUtil";
import {
  BigNum,
  TransactionWitnessSet,
} from "@emurgo/cardano-serialization-lib-nodejs";
import * as TTLBound from "./TTLBound";
import type { Address, Value } from "@emurgo/cardano-serialization-lib-nodejs";
import * as Cardano from "@emurgo/cardano-serialization-lib-nodejs";
import { expect, test } from "vitest";

function createSessions(): [Session.Session, Session.Session] {
  const channel1 = new ChannelPure<any>("1");
  const channel2 = new ChannelPure<any>("2");
  channel1.connect(channel2);
  channel2.connect(channel1);
  const session1 = new Session.Session(channel1, Cardano);
  const session2 = new Session.Session(channel2, Cardano);
  return [session1, session2];
}

const mkScriptHash = TestUtil.mkScriptHash(Cardano);
const mkAssetName = TestUtil.mkAssetName(Cardano);
const mkValue = TestUtil.mkValue(Cardano);
const mkUtxo = TestUtil.mkUtxo(Cardano);
const mkAddress = TestUtil.mkAddress(Cardano);

// State

test("Can update the ttl when not locked", () => {
  const [session1, session2] = createSessions();
  const ttlBound = TTLBound.initTTL();
  ttlBound.high = 80;
  ttlBound.low = 30;
  session1.updateMyTTLBound(ttlBound);
  expect(session1.getState().myOffer.ttl.high).toBe(80);
  expect(session1.getState().myOffer.ttl.low).toBe(30);

  expect(session1.getState().theirViewOfTheirOffer.ttl.high).toBe(80);
  expect(session1.getState().theirViewOfTheirOffer.ttl.low).toBe(30);

  expect(session2.getState().theirOffer.ttl.high).toBe(80);
  expect(session2.getState().theirOffer.ttl.low).toBe(30);

  expect(session2.getState().theirViewOfMyOffer.ttl.high).toBe(80);
  expect(session2.getState().theirViewOfMyOffer.ttl.low).toBe(30);
});

test("Can update the others value when not locked", () => {
  const [session1, session2] = createSessions();
  session1.updateMyADA(BigNum.from_str("1000"));
  expect(session1.getState().myOffer.value.coin().to_str()).toBe("1000");
  expect(session1.getState().theirViewOfTheirOffer.value.coin().to_str()).toBe(
    "1000"
  );
  expect(session2.getState().theirViewOfMyOffer.value.coin().to_str()).toBe(
    "1000"
  );
  expect(session2.getState().theirOffer.value.coin().to_str()).toBe("1000");
});

test("Can not update the others value when they are locked", () => {
  const [session1, session2] = createSessions();
  session2.updateMyLock(true);
  session1.updateMyADA(BigNum.from_str("1000"));
  expect(session1.getState().myOffer.value.coin().to_str()).toBe("1000");
  expect(session1.getState().theirViewOfTheirOffer.value.coin().to_str()).toBe(
    "0"
  );
  expect(session2.getState().theirViewOfMyOffer.value.coin().to_str()).toBe(
    "1000"
  );
  expect(session2.getState().theirOffer.value.coin().to_str()).toBe("0");
});

test("Can not update my value when I am locked", () => {
  const [session1, session2] = createSessions();
  session1.updateMyLock(true);
  session1.updateMyADA(BigNum.from_str("1000"));
  expect(session1.getState().myOffer.value.coin().to_str()).toBe("0");
  expect(session1.getState().theirViewOfTheirOffer.value.coin().to_str()).toBe(
    "0"
  );
  expect(session2.getState().theirViewOfMyOffer.value.coin().to_str()).toBe(
    "0"
  );
  expect(session2.getState().theirOffer.value.coin().to_str()).toBe("0");
});

test("Can update lock when locked", () => {
  const [session1, session2] = createSessions();
  session1.updateMyLock(true);
  session2.updateMyLock(true);
  expect(session1.getState().theirViewOfMyOffer.locked).toBeTruthy();
  expect(session2.getState().theirViewOfMyOffer.locked).toBeTruthy();
});

test("Can update utxos", () => {
  const [session1, session2] = createSessions();
  const val = mkValue(BigNum.from_str("100"), []);
  const utxo = mkUtxo(1, val);
  session1.updateMyUTxOs([utxo]);
  expect(session1.getState().myOffer.utxos.length).toBe(1);
  expect(session2.getState().theirViewOfMyOffer.utxos.length).toBe(1);
});

test("Can not update utxos when I am locked", () => {
  const [session1, session2] = createSessions();
  session1.updateMyLock(true);
  const val = mkValue(BigNum.from_str("100"), []);
  const utxo = mkUtxo(1, val);
  session1.updateMyUTxOs([utxo]);
  expect(session1.getState().myOffer.utxos.length).toBe(0);
  expect(session2.getState().theirViewOfMyOffer.utxos.length).toBe(0);
});

test("Can update address", () => {
  const [session1, session2] = createSessions();
  const addr = mkAddress();
  session1.updateMyAddress(addr);
  expect(session1.getState().myOffer.address?.to_bech32("test")).toBe(
    addr.to_bech32("test")
  );
  expect(
    session2.getState().theirViewOfMyOffer.address?.to_bech32("test")
  ).toBe(addr.to_bech32("test"));
});

test("Can not update address when I am locked", () => {
  const [session1, session2] = createSessions();
  const addr = mkAddress();
  session1.updateMyLock(true);
  session1.updateMyAddress(addr);
  expect(session1.getState().myOffer.address?.to_bech32("test")).toBe(
    undefined
  );
  expect(
    session2.getState().theirViewOfMyOffer.address?.to_bech32("test")
  ).toBe(undefined);
});

test("When unlocked state is the view is updated", () => {
  const [session1, session2] = createSessions();
  session2.updateMyLock(true);
  session1.updateMyADA(BigNum.from_str("1000"));
  expect(session2.getState().theirViewOfMyOffer.value.coin().to_str()).toBe(
    "1000"
  );
  expect(session2.getState().theirOffer.value.coin().to_str()).toBe("0");
  session2.updateMyLock(false);
  expect(session2.getState().theirOffer.value.coin().to_str()).toBe("1000");
});

test("Updates are pure when value change", () => {
  const [session1] = createSessions();
  const state1 = session1.getState();
  session1.updateMyADA(BigNum.from_str("1000"));
  const state2 = session1.getState();
  expect(state1 == state2).toBeFalsy();
  expect(state1.myOffer.value == state2.myOffer.value).toBeFalsy();
});

test("Updates are pure when lock change", () => {
  const [session1] = createSessions();
  const state1 = session1.getState();
  session1.updateMyLock(true);
  const state2 = session1.getState();
  expect(state1 == state2).toBeFalsy();
});

test("Updates are pure when address change", () => {
  const [session1] = createSessions();
  const state1 = session1.getState();
  session1.updateMyAddress(mkAddress());
  const state2 = session1.getState();
  expect(state1.myOffer.address == state2.myOffer.address).toBeFalsy();
});

test("Can Update networkID when not locked", () => {
  const [session1, session2] = createSessions();
  session1.updateMyNetworkID("Testnet");
  expect(session1.getState().myOffer.networkID).toBe("Testnet");
  expect(session1.getState().theirViewOfTheirOffer.networkID).toBe("Testnet");
  expect(session2.getState().theirOffer.networkID).toBe("Testnet");
  expect(session2.getState().theirViewOfMyOffer.networkID).toBe("Testnet");
});

// Offer

test("Creating an offer", () => {
  const [session1, session2] = createSessions();
  session1.createOffer(TransactionWitnessSet.new());
  expect(session1.getOffer()?.kind).toBe("TheyArePending");
  expect(session2.getOffer()?.kind).toBe("IAmPending");
});

test("Accepting an offer", () => {
  const [session1, session2] = createSessions();
  session1.createOffer(TransactionWitnessSet.new());
  expect(session1.getOffer()?.kind).toBe("TheyArePending");
  expect(session2.getOffer()?.kind).toBe("IAmPending");

  session2.acceptOffer("asdasd");

  expect(session1.getOffer()?.kind).toBe("OfferAccept");
  expect(session2.getOffer()?.kind).toBe("OfferAccept");
});

test("Rejecting an offer", () => {
  const [session1, session2] = createSessions();
  session1.createOffer(TransactionWitnessSet.new());
  expect(session1.getOffer()?.kind).toBe("TheyArePending");
  expect(session2.getOffer()?.kind).toBe("IAmPending");

  session2.rejectOffer();

  expect(session1.getOffer()?.kind).toBe("OfferReject");
  expect(session2.getOffer()?.kind).toBe(undefined);
});

test("My address is not removed on lost connection", () => {
  const [session1, session2] = createSessions();
  // Session1 State
  session1.updateMyAddress(mkAddress(1));
  //Session 2 state
  session2.updateMyAddress(mkAddress(2));

  expect(session2.getTheirAddress()?.to_bech32("test")).toBe(
    mkAddress(1).to_bech32("test")
  );

  expect(session2.getMyAddress()?.to_bech32("test")).toBe(
    mkAddress(2).to_bech32("test")
  );

  session1.destroy();
  // Check that destroying resets everything on the other side

  expect(session2.getTheirAddress()?.to_bech32("test")).toBe(undefined);

  // Check that Session2 state is unaffected
  expect(session2.getMyAddress()?.to_bech32("test")).toBe(
    mkAddress(2).to_bech32("test")
  );
});

test("Sync state on connection", () => {
  const channel1 = new ChannelPure<any>("1");
  const channel2 = new ChannelPure<any>("2");
  const session1 = new Session.Session(channel1, Cardano);
  const session2 = new Session.Session(channel2, Cardano);
  // Session1 State
  session1.updateMyADA(BigNum.from_str("1000000"));
  session1.updateMyAddress(mkAddress(1));
  session1.updateMyNetworkID("Testnet");
  const utxo1 = mkUtxo(1, mkValue(BigNum.from_str("10"), []));
  session1.updateMyUTxOs([utxo1]);
  session1.addMyAsset(mkScriptHash(1), mkAssetName("H"), BigNum.from_str("1"));
  session1.updateMyLock(true);

  //Add listeners
  let their2NetworkID: string | null = "Wrong";
  session2.onTheirNetworkID((network) => {
    their2NetworkID = network;
  });
  let their2Value: Value = Cardano.Value.zero();
  session2.onTheirValue((val) => {
    their2Value = val;
  });
  let their2Address: Address | null = null;
  session2.onTheirAddress((val) => {
    their2Address = val;
  });
  let their2Lock: boolean | undefined = undefined;
  session2.onTheirLock((val) => {
    their2Lock = val;
  });

  channel1.connect(channel2);
  channel2.connect(channel1);
  // Check that destroying resets everything on the other side

  expect(session2.getTheirValue().coin().to_str()).toBe("1000000");
  expect(session2.getTheirAddress()?.to_bech32("test")).toBe(
    mkAddress(1).to_bech32("test")
  );
  expect(session2.getTheirNetworkID()).toBe("Testnet");
  expect(session2.getTheirUtxos().map(Session.encodeUtxo)).toStrictEqual(
    [utxo1].map(Session.encodeUtxo)
  );
  expect(
    ValueExtra.lookup(Cardano)(
      mkScriptHash(1),
      mkAssetName("H"),
      session2.getTheirValue()
    ).to_str()
  ).toBe("1");
  expect(session2.getTheirLock()).toBeTruthy();

  // Listener Values

  expect(their2Value.coin().to_str()).toBe("1000000");
  expect(their2Address !== undefined).toBeTruthy();
  expect(their2NetworkID).toBe("Testnet");
  expect(
    ValueExtra.lookup(Cardano)(
      mkScriptHash(1),
      mkAssetName("H"),
      their2Value
    ).to_str()
  ).toBe("1");
  expect(their2Lock).toBeTruthy();
});

test("My network is not removed on lost connection", () => {
  const [session1, session2] = createSessions();

  let my1NetworkID: string | null = "Wrong";
  session1.onMyNetworkID((network) => {
    my1NetworkID = network;
  });
  let their1NetworkID: string | null = "Wrong";
  session1.onTheirNetworkID((network) => {
    their1NetworkID = network;
  });

  let my2NetworkID: string | null = "Wrong";
  session2.onMyNetworkID((network) => {
    my2NetworkID = network;
  });
  let their2NetworkID: string | null = "Wrong";
  session2.onTheirNetworkID((network) => {
    their2NetworkID = network;
  });

  // Session1 State
  session1.updateMyNetworkID("Mainnet");
  //Session 2 state
  session2.updateMyNetworkID("Testnet");

  expect(my1NetworkID).toBe("Mainnet");
  expect(their1NetworkID).toBe("Testnet");
  expect(my2NetworkID).toBe("Testnet");
  expect(their2NetworkID).toBe("Mainnet");

  expect(session1.getMyNetworkID()).toBe("Mainnet");
  expect(session1.getTheirNetworkID()).toBe("Testnet");
  expect(session2.getMyNetworkID()).toBe("Testnet");
  expect(session2.getTheirNetworkID()).toBe("Mainnet");

  session1.destroy();
  // Check that destroying resets everything on the other side
  expect(session1.getMyNetworkID()).toBe("Mainnet");
  expect(session1.getTheirNetworkID()).toBe(null);
  expect(session2.getMyNetworkID()).toBe("Testnet");
  expect(session2.getTheirNetworkID()).toBe(null);

  expect(my1NetworkID).toBe("Mainnet");
  expect(their1NetworkID).toBe(null);
  expect(my2NetworkID).toBe("Testnet");
  expect(their2NetworkID).toBe(null);
});

// Resetting their side of trade when connection is lost

test("Their side is reset when the connection is lost ", () => {
  const [session1, session2] = createSessions();
  // Session1 State
  session1.updateMyADA(BigNum.from_str("1000000"));
  session1.updateMyAddress(mkAddress(1));
  session1.updateMyNetworkID("Testnet");
  const utxo1 = mkUtxo(1, mkValue(BigNum.from_str("10"), []));
  session1.updateMyUTxOs([utxo1]);
  session1.addMyAsset(mkScriptHash(1), mkAssetName("H"), BigNum.from_str("1"));
  session1.updateMyLock(true);

  //Session 2 state
  session2.updateMyADA(BigNum.from_str("1000000"));
  session2.updateMyAddress(mkAddress(1));
  expect(session2.getMyAddress()?.to_bech32("test")).toBe(
    mkAddress(1).to_bech32("test")
  );
  session2.updateMyNetworkID("Testnet");
  const utxo2 = mkUtxo(1, mkValue(BigNum.from_str("10"), []));
  session2.updateMyUTxOs([utxo2]);
  session2.addMyAsset(mkScriptHash(1), mkAssetName("H"), BigNum.from_str("1"));

  // Check that all updates gets picked up by other side
  expect(session2.getTheirValue().coin().to_str()).toBe("1000000");
  expect(
    ValueExtra.lookup(Cardano)(
      mkScriptHash(1),
      mkAssetName("H"),
      session2.getTheirValue()
    ).to_str()
  ).toBe("1");
  expect(session2.getTheirAddress()?.to_bech32("test")).toBe(
    mkAddress(1).to_bech32("test")
  );
  expect(session2.getTheirNetworkID()).toBe("Testnet");
  expect(session2.getTheirLock()).toBeTruthy();
  expect(session2.getTheirUtxos().map(Session.encodeUtxo)).toStrictEqual(
    [utxo1].map(Session.encodeUtxo)
  );

  expect(session2.getMyValue().coin().to_str()).toBe("1000000");
  expect(
    ValueExtra.lookup(Cardano)(
      mkScriptHash(1),
      mkAssetName("H"),
      session2.getMyValue()
    ).to_str()
  ).toBe("1");
  expect(session2.getMyAddress()?.to_bech32("test")).toBe(
    mkAddress(1).to_bech32("test")
  );
  expect(session2.getMyNetworkID()).toBe("Testnet");
  expect(session2.getMyUtxos().map(Session.encodeUtxo)).toStrictEqual(
    [utxo1].map(Session.encodeUtxo)
  );

  session1.destroy();
  // Check that destroying resets everything on the other side
  expect(session2.getTheirValue().coin().to_str()).toBe("0");
  expect(
    ValueExtra.lookup(Cardano)(
      mkScriptHash(1),
      mkAssetName("H"),
      session2.getTheirValue()
    ).to_str()
  ).toBe("0");
  expect(session2.getTheirAddress()?.to_bech32("test")).toBe(undefined);
  expect(session2.getTheirNetworkID()).toBe(null);
  expect(session2.getTheirLock()).toBeFalsy();
  expect(session2.getTheirUtxos().map(Session.encodeUtxo)).toStrictEqual(
    [].map(Session.encodeUtxo)
  );

  // Check that Session2 state is unaffected
  expect(session2.getMyValue().coin().to_str()).toBe("1000000");
  expect(
    ValueExtra.lookup(Cardano)(
      mkScriptHash(1),
      mkAssetName("H"),
      session2.getMyValue()
    ).to_str()
  ).toBe("1");
  expect(session2.getMyAddress()?.to_bech32("test")).toBe(
    mkAddress(1).to_bech32("test")
  );
  expect(session2.getMyNetworkID()).toBe("Testnet");
  expect(session2.getMyLock()).toBeFalsy();
  expect(session2.getMyUtxos().map(Session.encodeUtxo)).toStrictEqual(
    [utxo2].map(Session.encodeUtxo)
  );
});

// tradeMissMatch

function expectMatch(
  kind: Session.TradeMissMatchKind,
  who: "I" | "Them",
  errors: Session.TradeMissMatch[]
): void {
  let foundMatch = false;
  for (let i = 0; i < errors.length; i++) {
    foundMatch =
      (errors[i].kind === kind && errors[i].who === who) || foundMatch;
  }
  if (!foundMatch) {
    expect(errors).toStrictEqual([]);
  }
}

test("Session.tradeMissMatch - I do not have the correct ADA amount.", () => {
  const fullState = Session.initFullState(Cardano);
  fullState.myOffer.value = mkValue(BigNum.zero(), []);
  fullState.theirViewOfTheirOffer.value = mkValue(BigNum.from_str("10"), []);

  const errors: Session.TradeMissMatch[] = Session.tradeMissMatch(fullState);
  expectMatch("ADANotMatching", "I", errors);
});

test("Session.tradeMissMatch - They do not have the correct ADA amount.", () => {
  const fullState = Session.initFullState(Cardano);
  fullState.theirOffer.value = mkValue(BigNum.zero(), []);
  fullState.theirViewOfMyOffer.value = mkValue(BigNum.from_str("10"), []);

  const errors: Session.TradeMissMatch[] = Session.tradeMissMatch(fullState);
  expectMatch("ADANotMatching", "Them", errors);
});

test("Session.tradeMissMatch - They do not have matching assets.", () => {
  const fullState = Session.initFullState(Cardano);
  fullState.theirOffer.value = mkValue(BigNum.zero(), [
    {
      hash: mkScriptHash(1),
      assets: [
        {
          assetName: mkAssetName("a"),
          amount: BigNum.from_str("100"),
        },
      ],
    },
  ]);
  fullState.theirViewOfMyOffer.value = mkValue(BigNum.zero(), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("99") }],
    },
  ]);

  const errors: Session.TradeMissMatch[] = Session.tradeMissMatch(fullState);
  expectMatch("NativeAssetNotMatching", "Them", errors);
});

test("Session.tradeMissMatch - They do not have matching assets.", () => {
  const fullState = Session.initFullState(Cardano);
  fullState.myOffer.value = mkValue(BigNum.zero(), [
    {
      hash: mkScriptHash(1),
      assets: [
        {
          assetName: mkAssetName("a"),
          amount: BigNum.from_str("100"),
        },
      ],
    },
  ]);
  fullState.theirViewOfTheirOffer.value = mkValue(BigNum.zero(), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("99") }],
    },
  ]);

  const errors: Session.TradeMissMatch[] = Session.tradeMissMatch(fullState);
  expectMatch("NativeAssetNotMatching", "I", errors);
});

test("Session.tradeMissMatch - I do not have defined address.", () => {
  const fullState = Session.initFullState(Cardano);
  fullState.myOffer.address = null;
  fullState.theirViewOfTheirOffer.address = null;
  const errors: Session.TradeMissMatch[] = Session.tradeMissMatch(fullState);
  expectMatch("NoAddress", "I", errors);
});

test("Session.tradeMissMatch - They do not have defined address.", () => {
  const fullState = Session.initFullState(Cardano);
  fullState.theirOffer.address = null;
  fullState.theirViewOfMyOffer.address = null;
  const errors: Session.TradeMissMatch[] = Session.tradeMissMatch(fullState);
  expectMatch("NoAddress", "Them", errors);
});

test("Session.tradeMissMatch - I do not have matching address.", () => {
  const fullState = Session.initFullState(Cardano);
  fullState.myOffer.address = mkAddress(0);
  fullState.theirViewOfTheirOffer.address = mkAddress(1);
  const errors: Session.TradeMissMatch[] = Session.tradeMissMatch(fullState);
  expectMatch("AddressNotMatching", "I", errors);
});

test("Session.tradeMissMatch - I do not have matching address.", () => {
  const fullState = Session.initFullState(Cardano);
  fullState.theirOffer.address = mkAddress(0);
  fullState.theirViewOfMyOffer.address = mkAddress(1);
  const errors: Session.TradeMissMatch[] = Session.tradeMissMatch(fullState);
  expectMatch("AddressNotMatching", "Them", errors);
});

test("Session.tradeMissMatch - I do not have matching address.", () => {
  const fullState = Session.initFullState(Cardano);

  const utxo1 = mkUtxo(1, mkValue(BigNum.from_str("10"), []));
  const utxo2 = mkUtxo(1, mkValue(BigNum.from_str("100"), []));
  fullState.myOffer.utxos = [utxo1];
  fullState.theirViewOfTheirOffer.utxos = [utxo2];
  const errors: Session.TradeMissMatch[] = Session.tradeMissMatch(fullState);
  expectMatch("UtxosNotMatching", "I", errors);
});

test("Session.tradeMissMatch - I do not have matching address.", () => {
  const fullState = Session.initFullState(Cardano);

  const utxo1 = mkUtxo(1, mkValue(BigNum.from_str("10"), []));
  const utxo2 = mkUtxo(1, mkValue(BigNum.from_str("100"), []));
  fullState.theirOffer.utxos = [utxo1];
  fullState.theirViewOfMyOffer.utxos = [utxo2];
  const errors: Session.TradeMissMatch[] = Session.tradeMissMatch(fullState);
  expectMatch("UtxosNotMatching", "Them", errors);
});

test("Session.tradeMissMatch - Must be on the same network.", () => {
  const fullState = Session.initFullState(Cardano);
  fullState.myOffer.networkID = "Mainnet";
  fullState.theirOffer.networkID = "Mainnet";
  fullState.theirViewOfMyOffer.networkID = "Testnet";
  fullState.theirViewOfTheirOffer.networkID = "Mainnet";
  const errors: Session.TradeMissMatch[] = Session.tradeMissMatch(fullState);
  expectMatch("MustBeOnSameNetwork", "I", errors);
});
