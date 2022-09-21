import { expect, test } from "vitest";
import * as TxBuilder from "./TxBuilder";
import {
  BigNum,
  Value,
  Address,
  TransactionBuilder,
} from "@emurgo/cardano-serialization-lib-nodejs";
import * as TestUtil from "./TestUtil";
import * as ValueExtra from "./ValueExtra";
import * as Cardano from "@emurgo/cardano-serialization-lib-nodejs";
import * as CardanoOld from "cardano-serialization-lib-nodejs-old";

const mkScriptHash = TestUtil.mkScriptHash(Cardano);
const mkAssetName = TestUtil.mkAssetName(Cardano);
const mkValue = TestUtil.mkValue(Cardano);
const mkUtxo = TestUtil.mkUtxo(Cardano);

////////////////////////////////////////////////////////////////////////////////
// validUTxOs
////////////////////////////////////////////////////////////////////////////////

test("validUTxOs - no utxos", () => {
  expect(TxBuilder.validUTxOs([], [])).toBeTruthy();
});

test("validUTxOs - only utxos in one", () => {
  expect(
    TxBuilder.validUTxOs([mkUtxo(1, mkValue(BigNum.from_str("10000000")))], [])
  ).toBeTruthy();
});

test("validUTxOs - same utxo", () => {
  const u1 = mkUtxo(1, mkValue(BigNum.from_str("10000000")));
  expect(TxBuilder.validUTxOs([u1], [u1])).toBeFalsy();
});

test("validUTxOs - same utxo", () => {
  const u1 = mkUtxo(1, mkValue(BigNum.from_str("10000000")));
  const u2 = mkUtxo(2, mkValue(BigNum.from_str("10000000")));
  const u3 = mkUtxo(3, mkValue(BigNum.from_str("10000000")));
  const u4 = mkUtxo(4, mkValue(BigNum.from_str("10000000")));
  expect(TxBuilder.validUTxOs([u1, u2, u3], [u4])).toBeTruthy();
  expect(TxBuilder.validUTxOs([u1, u2, u3], [u4, u3])).toBeFalsy();
});

////////////////////////////////////////////////////////////////////////////////
// outputSelection
////////////////////////////////////////////////////////////////////////////////

const inputSelection = TxBuilder.inputSelection(Cardano);

test("outputSelection - only ADA - exactly enough to cover it", () => {
  const ada = BigNum.from_str("10");
  const assets = [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("10") }],
    },
  ];
  const val = mkValue(ada, assets);
  const utxo = mkUtxo(1, val);

  expect(inputSelection(val, [utxo])).toEqual([utxo]);
});

test("outputSelection - 3 UTxOs - 1 is enough", () => {
  const req = mkValue(BigNum.from_str("10"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("10") }],
    },
  ]);

  const val1 = mkValue(BigNum.from_str("2"), []);

  const val2 = mkValue(BigNum.from_str("12"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("20") }],
    },
  ]);

  const val3 = mkValue(BigNum.from_str("20"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("8") }],
    },
  ]);

  const res = mkUtxo(2, val2);
  const utxos = [mkUtxo(1, val1), res, mkUtxo(3, val3)];

  expect(inputSelection(req, utxos)).toEqual([res]);
});

test("outputSelection - 3 UTxOs - 2 is enough", () => {
  const req = mkValue(BigNum.from_str("10"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("10") }],
    },
  ]);

  const val1 = mkValue(BigNum.from_str("8"), []);

  const val2 = mkValue(BigNum.from_str("4"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("20") }],
    },
  ]);

  const val3 = mkValue(BigNum.from_str("3"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("8") }],
    },
  ]);
  const utxo1 = mkUtxo(1, val1);
  const utxo2 = mkUtxo(2, val2);
  const utxo3 = mkUtxo(3, val3);

  expect(inputSelection(req, [utxo1, utxo2, utxo3])).toEqual([utxo2, utxo1]);
});

test("outputSelection - 2 assets - 3 UTxOs - 1 is enough", () => {
  const req = mkValue(BigNum.from_str("10"), [
    {
      hash: mkScriptHash(1),
      assets: [
        { assetName: mkAssetName("a"), amount: BigNum.from_str("10") },
        { assetName: mkAssetName("b"), amount: BigNum.from_str("8") },
      ],
    },
  ]);

  const val1 = mkValue(BigNum.from_str("8"), []);

  const val2 = mkValue(BigNum.from_str("20"), [
    {
      hash: mkScriptHash(1),
      assets: [
        { assetName: mkAssetName("a"), amount: BigNum.from_str("20") },
        { assetName: mkAssetName("b"), amount: BigNum.from_str("20") },
      ],
    },
  ]);

  const val3 = mkValue(BigNum.from_str("3"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("8") }],
    },
  ]);
  const utxo1 = mkUtxo(1, val1);
  const utxo2 = mkUtxo(2, val2);
  const utxo3 = mkUtxo(3, val3);

  expect(inputSelection(req, [utxo1, utxo2, utxo3])).toEqual([utxo2]);
});

test("outputSelection - Not Enough ADA", () => {
  const req = mkValue(BigNum.from_str("100"), [
    {
      hash: mkScriptHash(1),
      assets: [
        { assetName: mkAssetName("a"), amount: BigNum.from_str("10") },
        { assetName: mkAssetName("b"), amount: BigNum.from_str("8") },
      ],
    },
  ]);

  const val1 = mkValue(BigNum.from_str("8"), []);

  const val2 = mkValue(BigNum.from_str("20"), [
    {
      hash: mkScriptHash(1),
      assets: [
        { assetName: mkAssetName("a"), amount: BigNum.from_str("20") },
        { assetName: mkAssetName("b"), amount: BigNum.from_str("20") },
      ],
    },
  ]);

  const val3 = mkValue(BigNum.from_str("3"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("8") }],
    },
  ]);
  const utxo1 = mkUtxo(1, val1);
  const utxo2 = mkUtxo(2, val2);
  const utxo3 = mkUtxo(3, val3);

  expect(() => {
    inputSelection(req, [utxo1, utxo2, utxo3]);
  }).toThrow();
});

test("outputSelection - Not Enough Assets", () => {
  const req = mkValue(BigNum.from_str("10"), [
    {
      hash: mkScriptHash(1),
      assets: [
        {
          assetName: mkAssetName("a"),
          amount: BigNum.from_str("100"),
        },
        { assetName: mkAssetName("b"), amount: BigNum.from_str("8") },
      ],
    },
  ]);

  const val1 = mkValue(BigNum.from_str("8"), []);

  const val2 = mkValue(BigNum.from_str("20"), [
    {
      hash: mkScriptHash(1),
      assets: [
        { assetName: mkAssetName("a"), amount: BigNum.from_str("20") },
        { assetName: mkAssetName("b"), amount: BigNum.from_str("20") },
      ],
    },
  ]);

  const val3 = mkValue(BigNum.from_str("3"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("8") }],
    },
  ]);
  const utxo1 = mkUtxo(1, val1);
  const utxo2 = mkUtxo(2, val2);
  const utxo3 = mkUtxo(3, val3);

  expect(() => {
    inputSelection(req, [utxo1, utxo2, utxo3]);
  }).toThrow();
});

////////////////////////////////////////////////////////////////////////////////
// Test Parameters
////////////////////////////////////////////////////////////////////////////////

const fakeNetworkParametersPreVasil: TxBuilder.NetworkParameters = {
  linearFee: {
    minFeeA: "44",
    minFeeB: "155381",
  },
  minUtxo: "1000000",
  poolDeposit: "500000000",
  keyDeposit: "2000000",
  coinsPerUtxoWord: "34482",
  coinsPerUtxoByte: "34482",
  maxValSize: 5000,
  priceMem: 5.77e-2,
  priceStep: 7.21e-5,
  maxTxSize: 4000,
  slot: 300,
};

const fakeNetworkParametersPostVasil: TxBuilder.NetworkParameters = {
  linearFee: {
    minFeeA: "44",
    minFeeB: "155381",
  },
  minUtxo: "1000000",
  poolDeposit: "500000000",
  keyDeposit: "2000000",
  coinsPerUtxoWord: "4310",
  coinsPerUtxoByte: "4310",
  maxValSize: 5000,
  priceMem: 5.77e-2,
  priceStep: 7.21e-5,
  maxTxSize: 4000,
  slot: 300,
};

const fakeFeeConfigPreVasil = TxBuilder.mkFeeConfig(Cardano)(
  "Mainnet",
  fakeNetworkParametersPreVasil
);
const fakeFeeConfigPostVasil = TxBuilder.mkFeeConfig(Cardano)(
  "Testnet",
  fakeNetworkParametersPostVasil
);
const fakeMyAddress = Address.from_bech32(
  "addr1q9sqs2fh4xdl9hfkknxp2k304kwrj86z3228lr8m6c2g2ne82szk0twjcev7qlssvmffaket0fx4sf5jlhl8qcwm30hqpvfej5"
);
const fakeTheirAddress = Address.from_bech32(
  "addr1q8ht5e3k5faup2r7tns80elj4u95nsujgdeelkq0up0c7s382szk0twjcev7qlssvmffaket0fx4sf5jlhl8qcwm30hqsahcnt"
);

////////////////////////////////////////////////////////////////////////////////
// TxBuilder.constructTxBuilder
////////////////////////////////////////////////////////////////////////////////

const outputSelection = TxBuilder.outputSelection(Cardano, CardanoOld);
const sumOutputs = TxBuilder.sumOutputs(Cardano);
const sumUtxos = TxBuilder.sumUtxos(Cardano);

test("outputSelection - Send Nothing", () => {
  const receiver = fakeMyAddress;

  const utxos = outputSelection(
    receiver,
    Cardano.Value.zero(),
    fakeFeeConfigPreVasil.coinsPerUtxoWord,
    fakeFeeConfigPreVasil.dataCost
  );

  expect(utxos.length).toBe(0);
  expect(ValueExtra.eq(Cardano.Value.zero(), sumOutputs(utxos))).toBeTruthy();
});

test("outputSelection - Send 2 ADA", () => {
  const receiver = fakeMyAddress;
  const value = Value.new(BigNum.from_str("2000000"));

  const outputs = outputSelection(
    receiver,
    value,
    fakeFeeConfigPreVasil.coinsPerUtxoWord,
    fakeFeeConfigPreVasil.dataCost
  );

  expect(ValueExtra.eq(value, sumOutputs(outputs))).toBeTruthy();
});

test("outputSelection - Send 0.5 ADA", () => {
  const receiver = fakeMyAddress;
  const value = Value.new(BigNum.from_str("500000"));

  const outputs = outputSelection(
    receiver,
    value,
    fakeFeeConfigPreVasil.coinsPerUtxoWord,
    fakeFeeConfigPreVasil.dataCost
  );
  const outputVal = sumOutputs(outputs);

  // Should have added min ADA amount
  expect(value.compare(outputVal)).toBeLessThan(0);
});

test("outputSelection - Send 2 ADA + one asset", () => {
  const receiver = fakeMyAddress;
  const hash = mkScriptHash(1);
  const assetName = mkAssetName("a");
  const value = mkValue(BigNum.from_str("500000"), [
    {
      hash: hash,
      assets: [
        {
          assetName: assetName,
          amount: BigNum.from_str("100000"),
        },
      ],
    },
  ]);

  const outputs = outputSelection(
    receiver,
    value,
    fakeFeeConfigPreVasil.coinsPerUtxoWord,
    fakeFeeConfigPreVasil.dataCost
  );
  const outputVal = sumOutputs(outputs);

  // Should have added min ADA amount
  expect(value.coin().compare(outputVal.coin())).toBeLessThan(0);
  expect(outputVal.multiasset()?.get(hash)?.get(assetName)?.to_str()).toBe(
    "100000"
  );
});

test("outputSelection - Send 0 ADA + 1 asset - Pre Vasil", () => {
  const hash = mkScriptHash(1);
  const assetName = mkAssetName("a");
  const ada = BigNum.from_str("0");
  const amount = BigNum.from_str("10");

  const value = mkValue(ada, [
    {
      hash: hash,
      assets: [{ amount: amount, assetName: assetName }],
    },
  ]);
  const outputs = outputSelection(
    fakeTheirAddress,
    value,
    fakeFeeConfigPreVasil.coinsPerUtxoWord,
    fakeFeeConfigPreVasil.dataCost
  );

  const total = sumOutputs(outputs);

  // Check native asset
  expect(total.multiasset()?.get(hash)?.get(assetName)?.to_str()).toBe(
    amount.to_str()
  );
  const valueOld = CardanoOld.Value.from_bytes(value.to_bytes());
  const coinsPerUtxoWordOld = CardanoOld.BigNum.from_bytes(
    fakeFeeConfigPreVasil.coinsPerUtxoWord.to_bytes()
  );
  const min_ada_old = CardanoOld.min_ada_required(
    valueOld,
    false,
    coinsPerUtxoWordOld
  );
  const min_ada = Cardano.BigNum.from_bytes(min_ada_old.to_bytes());

  expect(min_ada.compare(total.coin()) === 0).true;
});

test("outputSelection - Send 0 ADA + 1 asset - Post Vasil", () => {
  const hash = mkScriptHash(1);
  const assetName = mkAssetName("a");
  const ada = BigNum.from_str("0");
  const amount = BigNum.from_str("10");

  const value = mkValue(ada, [
    {
      hash: hash,
      assets: [{ amount: amount, assetName: assetName }],
    },
  ]);
  const outputs = outputSelection(
    fakeTheirAddress,
    value,
    fakeFeeConfigPostVasil.coinsPerUtxoWord,
    fakeFeeConfigPostVasil.dataCost
  );

  const total = sumOutputs(outputs);

  // Check native asset
  expect(total.multiasset()?.get(hash)?.get(assetName)?.to_str()).toBe(
    amount.to_str()
  );
  const min_ada = Cardano.min_ada_for_output(
    outputs[0],
    fakeFeeConfigPostVasil.dataCost!
  );

  expect(min_ada.compare(total.coin()) === 0).true;
});

test("inputSelection - Simple send of 8 ada", () => {
  const myVal1 = mkValue(BigNum.from_str("8000000"), []);

  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);

  const myVal2 = mkValue(BigNum.from_str("4000000"), []);

  const outputs = inputSelection(myVal2, [myUtxo1]);

  expect(sumUtxos(outputs).coin().to_str()).toBe("8000000");
});

////////////////////////////////////////////////////////////////////////////////
// TxBuilder.constructTxBuilder
////////////////////////////////////////////////////////////////////////////////

const constructTxBuilder = TxBuilder.constructTxBuilder(Cardano, CardanoOld);
const mkCommission = TxBuilder.mkCommission(Cardano);

test("TxBuilder.constructTxBuilder - No Commission - Simple send of ada", () => {
  const myVal1 = mkValue(BigNum.from_str("8000000"), []);

  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);

  const myOffer: TxBuilder.OfferParams = {
    address: fakeMyAddress,
    value: mkValue(BigNum.from_str("4000000"), []),
    utxos: [myUtxo1],
  };

  const myVal2 = mkValue(BigNum.from_str("3000000"), []);

  const myUtxo2 = mkUtxo(2, myVal2, fakeMyAddress);

  const theirOffer: TxBuilder.OfferParams = {
    address: fakeTheirAddress,
    value: mkValue(BigNum.from_str("0"), []),
    utxos: [myUtxo2],
  };

  const txBuilder = constructTxBuilder(
    fakeFeeConfigPreVasil,
    undefined,
    myOffer,
    theirOffer,
    fakeNetworkParametersPreVasil.slot
  );

  const input = txBuilder
    .get_explicit_input()
    .checked_add(txBuilder.get_implicit_input());
  const fee = txBuilder.get_fee_if_set();
  const output = fee
    ? txBuilder.get_explicit_output().checked_add(Value.new(fee))
    : txBuilder.get_explicit_output();

  expect(input.compare(output) === 0).toBeTruthy();
});

test("TxBuilder.constructTxBuilder - No Commission - Simple send of asset", () => {
  const myVal1 = mkValue(BigNum.from_str("8000000"), []);

  const myVal2 = mkValue(BigNum.from_str("20000000"), [
    {
      hash: mkScriptHash(1),
      assets: [
        { assetName: mkAssetName("a"), amount: BigNum.from_str("20") },
        { assetName: mkAssetName("b"), amount: BigNum.from_str("20") },
      ],
    },
  ]);

  const theirVal1 = mkValue(BigNum.from_str("3000000"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("c"), amount: BigNum.from_str("8") }],
    },
  ]);
  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);
  const myUtxo2 = mkUtxo(2, myVal2, fakeMyAddress);
  const theirUtxo1 = mkUtxo(3, theirVal1, fakeTheirAddress);

  const myOffer: TxBuilder.OfferParams = {
    address: fakeMyAddress,
    value: mkValue(BigNum.from_str("8000000"), [
      {
        hash: mkScriptHash(1),
        assets: [
          {
            assetName: mkAssetName("a"),
            amount: BigNum.from_str("10"),
          },
        ],
      },
    ]),
    utxos: [myUtxo1, myUtxo2],
  };

  const theirOffer: TxBuilder.OfferParams = {
    address: fakeTheirAddress,
    value: mkValue(BigNum.from_str("0"), [
      {
        hash: mkScriptHash(1),
        assets: [
          {
            assetName: mkAssetName("c"),
            amount: BigNum.from_str("8"),
          },
        ],
      },
    ]),
    utxos: [theirUtxo1],
  };

  const txBuilder = constructTxBuilder(
    fakeFeeConfigPreVasil,
    undefined,
    myOffer,
    theirOffer,
    fakeNetworkParametersPreVasil.slot
  );

  expect(txBuilderInBalance(txBuilder)).toBeTruthy();
});

test("TxBuilder.constructTxBuilder - need two utxos", () => {
  const myVal1 = mkValue(BigNum.from_str("8000000"), []);

  const myVal2 = mkValue(BigNum.from_str("9000000"), [
    {
      hash: mkScriptHash(1),
      assets: [
        { assetName: mkAssetName("a"), amount: BigNum.from_str("20") },
        { assetName: mkAssetName("b"), amount: BigNum.from_str("20") },
      ],
    },
  ]);

  const theirVal1 = mkValue(BigNum.from_str("3000000"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("c"), amount: BigNum.from_str("8") }],
    },
  ]);
  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);
  const myUtxo2 = mkUtxo(2, myVal2, fakeMyAddress);
  const theirUtxo1 = mkUtxo(3, theirVal1, fakeTheirAddress);

  const myOffer: TxBuilder.OfferParams = {
    address: fakeMyAddress,
    value: mkValue(BigNum.from_str("8000000"), [
      {
        hash: mkScriptHash(1),
        assets: [
          {
            assetName: mkAssetName("a"),
            amount: BigNum.from_str("10"),
          },
        ],
      },
    ]),
    utxos: [myUtxo1, myUtxo2],
  };

  const theirOffer: TxBuilder.OfferParams = {
    address: fakeTheirAddress,
    value: mkValue(BigNum.from_str("0"), [
      {
        hash: mkScriptHash(1),
        assets: [
          {
            assetName: mkAssetName("c"),
            amount: BigNum.from_str("8"),
          },
        ],
      },
    ]),
    utxos: [theirUtxo1],
  };

  const txBuilder = constructTxBuilder(
    fakeFeeConfigPreVasil,
    undefined,
    myOffer,
    theirOffer,
    fakeNetworkParametersPreVasil.slot
  );

  expect(txBuilderInBalance(txBuilder)).toBeTruthy();
});

test("TxBuilder.constructTxBuilder - ADA against ADA - one utxo each - with commission", () => {
  const myVal1 = mkValue(BigNum.from_str("12000000"), []);

  const theirVal1 = mkValue(BigNum.from_str("12000000"), []);
  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);
  const theirUtxo1 = mkUtxo(3, theirVal1, fakeTheirAddress);

  const myOffer: TxBuilder.OfferParams = {
    address: fakeMyAddress,
    value: mkValue(BigNum.from_str("2000000"), []),
    utxos: [myUtxo1],
  };

  const theirOffer: TxBuilder.OfferParams = {
    address: fakeTheirAddress,
    value: mkValue(BigNum.from_str("2000000"), []),
    utxos: [theirUtxo1],
  };

  const txBuilder = constructTxBuilder(
    fakeFeeConfigPreVasil,
    mkCommission("Mainnet"),
    myOffer,
    theirOffer,
    fakeNetworkParametersPreVasil.slot
  );

  expect(txBuilderInBalance(txBuilder)).toBeTruthy();
});

test("TxBuilder.constructTxBuilder - ADA against ADA - 2- utxos each with commission", () => {
  const myVal1 = mkValue(BigNum.from_str("12000000"), []);
  const myVal2 = mkValue(BigNum.from_str("12000000"), []);
  const theirVal1 = mkValue(BigNum.from_str("12000000"), []);
  const theirVal2 = mkValue(BigNum.from_str("12000000"), []);
  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);
  const myUtxo2 = mkUtxo(2, myVal2, fakeMyAddress);
  const theirUtxo1 = mkUtxo(3, theirVal1, fakeTheirAddress);
  const theirUtxo2 = mkUtxo(3, theirVal2, fakeTheirAddress);

  const myOffer: TxBuilder.OfferParams = {
    address: fakeMyAddress,
    value: mkValue(BigNum.from_str("2000000"), []),
    utxos: [myUtxo1, myUtxo2],
  };

  const theirOffer: TxBuilder.OfferParams = {
    address: fakeTheirAddress,
    value: mkValue(BigNum.from_str("2000000"), []),
    utxos: [theirUtxo1, theirUtxo2],
  };

  const txBuilder = constructTxBuilder(
    fakeFeeConfigPreVasil,
    mkCommission("Mainnet"),
    myOffer,
    theirOffer,
    fakeNetworkParametersPreVasil.slot
  );

  expect(txBuilderInBalance(txBuilder)).toBeTruthy();
});

test("TxBuilder.constructTxBuilder - I don not have enough ADA to send", () => {
  const myVal1 = mkValue(BigNum.from_str("1000000"), []);

  const theirVal1 = mkValue(BigNum.from_str("3000000"), []);

  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);
  const theirUtxo1 = mkUtxo(3, theirVal1, fakeTheirAddress);

  const myOffer: TxBuilder.OfferParams = {
    address: fakeMyAddress,
    value: mkValue(BigNum.from_str("2000000"), []),
    utxos: [myUtxo1],
  };

  const theirOffer: TxBuilder.OfferParams = {
    address: fakeTheirAddress,
    value: mkValue(BigNum.zero(), []),
    utxos: [theirUtxo1],
  };

  let err: TxBuilder.InsufficientAdaError | undefined = undefined;
  try {
    constructTxBuilder(
      fakeFeeConfigPreVasil,
      undefined,
      myOffer,
      theirOffer,
      fakeNetworkParametersPreVasil.slot
    );
  } catch (coughtErr) {
    if (coughtErr instanceof TxBuilder.InsufficientAdaError) {
      err = coughtErr;
    }
  }

  expect(err?.blame).toBe("You");
  expect(err?.found.to_str()).toBe("1000000");
});

test("TxBuilder.constructTxBuilder - They do not have enough ADA to send", () => {
  const myVal1 = mkValue(BigNum.from_str("1000000"), []);

  const theirVal1 = mkValue(BigNum.from_str("1000000"), []);

  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);
  const theirUtxo1 = mkUtxo(3, theirVal1, fakeTheirAddress);

  const myOffer: TxBuilder.OfferParams = {
    address: fakeMyAddress,
    value: mkValue(BigNum.zero(), []),
    utxos: [myUtxo1],
  };

  const theirOffer: TxBuilder.OfferParams = {
    address: fakeTheirAddress,
    value: mkValue(BigNum.from_str("2000000"), []),
    utxos: [theirUtxo1],
  };

  let err: TxBuilder.InsufficientAdaError | undefined = undefined;
  try {
    constructTxBuilder(
      fakeFeeConfigPreVasil,
      undefined,
      myOffer,
      theirOffer,
      fakeNetworkParametersPreVasil.slot
    );
  } catch (coughtErr) {
    if (coughtErr instanceof TxBuilder.InsufficientAdaError) {
      err = coughtErr;
    }
  }

  expect(err?.blame).toBe("They");
  expect(err?.found.to_str()).toBe("1000000");
});

test("TxBuilder.constructTxBuilder - I do not have enough ADA to cover commission", () => {
  const myVal1 = mkValue(BigNum.from_str("2000000"), []);

  const theirVal1 = mkValue(BigNum.from_str("10000000"), []);

  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);
  const theirUtxo1 = mkUtxo(3, theirVal1, fakeTheirAddress);

  const myOffer: TxBuilder.OfferParams = {
    address: fakeMyAddress,
    value: mkValue(BigNum.from_str("2000000"), []),
    utxos: [myUtxo1],
  };

  const theirOffer: TxBuilder.OfferParams = {
    address: fakeTheirAddress,
    value: mkValue(BigNum.zero(), []),
    utxos: [theirUtxo1],
  };

  let err: TxBuilder.InsufficientAdaError | undefined = undefined;
  try {
    constructTxBuilder(
      fakeFeeConfigPreVasil,
      mkCommission("Mainnet"),
      myOffer,
      theirOffer,
      fakeNetworkParametersPreVasil.slot
    );
  } catch (coughtErr) {
    if (coughtErr instanceof TxBuilder.InsufficientAdaError) {
      err = coughtErr;
    }
  }

  expect(err?.blame).toBe("You");
  expect(err?.found.to_str()).toBe("2000000");
});

test("TxBuilder.constructTxBuilder - They do not have enough ADA to cover commission", () => {
  const myVal1 = mkValue(BigNum.from_str("10000000"), []);

  const theirVal1 = mkValue(BigNum.from_str("2000000"), []);

  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);
  const theirUtxo1 = mkUtxo(3, theirVal1, fakeTheirAddress);

  const myOffer: TxBuilder.OfferParams = {
    address: fakeMyAddress,
    value: mkValue(BigNum.zero(), []),
    utxos: [myUtxo1],
  };

  const theirOffer: TxBuilder.OfferParams = {
    address: fakeTheirAddress,
    value: mkValue(BigNum.from_str("2000000"), []),
    utxos: [theirUtxo1],
  };

  let err: TxBuilder.InsufficientAdaError | undefined = undefined;
  try {
    constructTxBuilder(
      fakeFeeConfigPreVasil,
      mkCommission("Mainnet"),
      myOffer,
      theirOffer,
      fakeNetworkParametersPreVasil.slot
    );
  } catch (coughtErr) {
    if (coughtErr instanceof TxBuilder.InsufficientAdaError) {
      err = coughtErr;
    }
  }

  expect(err?.blame).toBe("They");
  expect(err?.found.to_str()).toBe("2000000");
});

test("TxBuilder.constructTxBuilder - I can not cover native asset", () => {
  const myVal1 = mkValue(BigNum.from_str("10000000"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("10") }],
    },
  ]);

  const theirVal1 = mkValue(BigNum.from_str("10000000"), []);

  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);
  const theirUtxo1 = mkUtxo(3, theirVal1, fakeTheirAddress);
  const scriptHash = mkScriptHash(1);

  const myOffer: TxBuilder.OfferParams = {
    address: fakeMyAddress,
    value: mkValue(BigNum.zero(), [
      {
        hash: scriptHash,
        assets: [
          {
            assetName: mkAssetName("a"),
            amount: BigNum.from_str("100"),
          },
        ],
      },
    ]),
    utxos: [myUtxo1],
  };

  const theirOffer: TxBuilder.OfferParams = {
    address: fakeTheirAddress,
    value: mkValue(BigNum.zero(), []),
    utxos: [theirUtxo1],
  };

  let err: TxBuilder.InsufficientNativeAssetError | undefined = undefined;
  try {
    constructTxBuilder(
      fakeFeeConfigPreVasil,
      mkCommission("Mainnet"),
      myOffer,
      theirOffer,
      fakeNetworkParametersPreVasil.slot
    );
  } catch (coughtErr) {
    if (coughtErr instanceof TxBuilder.InsufficientNativeAssetError) {
      err = coughtErr;
    }
  }

  expect(err?.blame).toBe("You");
  expect(err?.found.to_str()).toBe("10");
  expect(err?.required.to_str()).toBe("100");
  expect(err?.scriptHash.to_bech32("check")).toBe(
    scriptHash.to_bech32("check")
  );
});

test("TxBuilder.constructTxBuilder - They can not cover native asset", () => {
  const myVal1 = mkValue(BigNum.from_str("10000000"), []);

  const theirVal1 = mkValue(BigNum.from_str("10000000"), [
    {
      hash: mkScriptHash(1),
      assets: [{ assetName: mkAssetName("a"), amount: BigNum.from_str("10") }],
    },
  ]);

  const myUtxo1 = mkUtxo(1, myVal1, fakeMyAddress);
  const theirUtxo1 = mkUtxo(3, theirVal1, fakeTheirAddress);
  const scriptHash = mkScriptHash(1);

  const myOffer: TxBuilder.OfferParams = {
    address: fakeMyAddress,
    value: mkValue(BigNum.zero(), []),
    utxos: [myUtxo1],
  };

  const theirOffer: TxBuilder.OfferParams = {
    address: fakeTheirAddress,
    value: mkValue(BigNum.zero(), [
      {
        hash: scriptHash,
        assets: [
          {
            assetName: mkAssetName("a"),
            amount: BigNum.from_str("100"),
          },
        ],
      },
    ]),
    utxos: [theirUtxo1],
  };

  let err: TxBuilder.InsufficientNativeAssetError | undefined = undefined;
  try {
    constructTxBuilder(
      fakeFeeConfigPreVasil,
      mkCommission("Mainnet"),
      myOffer,
      theirOffer,
      fakeNetworkParametersPreVasil.slot
    );
  } catch (coughtErr) {
    if (coughtErr instanceof TxBuilder.InsufficientNativeAssetError) {
      err = coughtErr;
    }
  }

  expect(err?.blame).toBe("They");
  expect(err?.found.to_str()).toBe("10");
  expect(err?.required.to_str()).toBe("100");
  expect(err?.scriptHash.to_bech32("check")).toBe(
    scriptHash.to_bech32("check")
  );
});

function txBuilderInBalance(txBuilder: TransactionBuilder): boolean {
  const input = txBuilder
    .get_explicit_input()
    .checked_add(txBuilder.get_implicit_input());
  const fee = txBuilder.get_fee_if_set();
  const output = fee
    ? txBuilder.get_explicit_output().checked_add(Value.new(fee))
    : txBuilder.get_explicit_output();
  return input.compare(output) === 0;
}
