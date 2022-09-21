import type {
  Address,
  BigNum,
  LinearFee,
  TransactionUnspentOutput,
  TransactionOutput,
  Value,
  ScriptHash,
  TransactionBody,
  Transaction,
  TransactionWitnessSet,
  AssetName,
  DataCost,
} from "@emurgo/cardano-serialization-lib-browser";
import { BasicWallet } from "cardano-web-bridge-wrapper/lib/BasicWallet";
import { NetworkID } from "cardano-web-bridge-wrapper/lib/Wallet";
import BlockFrostAPI from "../API/BlockFrost/BlockFrostAPI";
import * as Types from "../API/BlockFrost/Types";
import * as BigNumExtra from "./BigNumExtra";
import * as ValueExtra from "./ValueExtra";
import * as CardanoUtil from "./Util";
import * as TTLBound from "../Network/TTLBound";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";
import * as CardanoSerializationLibOld from "cardano-serialization-lib-browser-old";
import * as Extra from "../Util/Extra";
import * as Util from "src/Util";
import * as TestUtil from "./TestUtil";

export type OfferParams = {
  address: Address;
  value: Value;
  utxos: TransactionUnspentOutput[];
};

export type FeeConfig = {
  linearFee: LinearFee;
  minUtxo: BigNum;
  poolDepsit: BigNum;
  keyDeposit: BigNum;
  maxValSize: number;
  maxTxSize: number;
  coinsPerUtxoWord: BigNum; // Legacy parameter
  dataCost?: DataCost;
};

export type Commission = {
  commissionFromMe: BigNum;
  commissionFromThem: BigNum;
  commissionAddress: Address;
};

export async function createTTLBound(
  networkID: NetworkID
): Promise<TTLBound.TTLBound> {
  const networkParameters = await initTx(networkID);
  const bound = TTLBound.initTTL();
  bound.low = networkParameters.slot + 100;
  bound.high = networkParameters.slot + 88000; // About 24h before transaction is invalid
  return bound;
}

const buildTxBody =
  (
    lib: typeof CardanoSerializationLib,
    lib2: typeof CardanoSerializationLibOld
  ) =>
  async (
    walletConnector: BasicWallet,
    myOffer: OfferParams,
    theirOffer: OfferParams,
    ttl: number
  ) => {
    const networkID = await walletConnector.getNetworkId();
    const commission = mkCommission(lib)(networkID);
    const networkParameters = await initTx(networkID);
    const feeConfig = mkFeeConfig(lib)(networkID, networkParameters);
    const txBuilder = constructTxBuilder(lib, lib2)(
      feeConfig,
      commission,
      myOffer,
      theirOffer,
      ttl
    );
    return txBuilder.build();
  };

export const signTx =
  (
    lib: typeof CardanoSerializationLib,
    lib2: typeof CardanoSerializationLibOld
  ) =>
  async (
    walletConnector: BasicWallet,
    myOffer: OfferParams,
    theirOffer: OfferParams,
    ttl: number
  ) => {
    const txBody: TransactionBody = await buildTxBody(lib, lib2)(
      walletConnector,
      myOffer,
      theirOffer,
      ttl
    );

    const toBeSignedTx: Transaction = lib.Transaction.new(
      txBody,
      lib.TransactionWitnessSet.new(),
      undefined
    );

    return await walletConnector.signTx(toBeSignedTx, true);
  };

export const makeTx =
  (
    lib: typeof CardanoSerializationLib,
    lib2: typeof CardanoSerializationLibOld
  ) =>
  async (
    walletConnector: BasicWallet,
    myOffer: OfferParams,
    theirOffer: OfferParams,
    theirWitnessSet: TransactionWitnessSet,
    ttl: number
  ) => {
    // Reverse order of theirOffer, myOffer so that we build the transactions identically to the other one
    const txBody: TransactionBody = await buildTxBody(lib, lib2)(
      walletConnector,
      theirOffer,
      myOffer,
      ttl
    );

    const toBeSignedTx: Transaction = lib.Transaction.new(
      txBody,
      lib.TransactionWitnessSet.new(),
      undefined
    );

    const witnessSet: TransactionWitnessSet = await walletConnector.signTx(
      toBeSignedTx,
      true
    );

    const finalWitnessSet = lib.TransactionWitnessSet.new();
    const myVKeys = witnessSet.vkeys();
    const theirVKeys = theirWitnessSet.vkeys();
    if (myVKeys && theirVKeys) {
      const allVKeys = CardanoUtil.mergeVKeyWitnesses(lib)(myVKeys, theirVKeys);
      finalWitnessSet.set_vkeys(allVKeys);
    } else if (myVKeys) {
      finalWitnessSet.set_vkeys(myVKeys);
    } else if (theirVKeys) {
      finalWitnessSet.set_vkeys(theirVKeys);
    }

    const signedTx: Transaction = lib.Transaction.new(
      txBody,
      finalWitnessSet,
      undefined
    );

    const tx = await walletConnector.submitTx(signedTx);
    return tx;
  };

const mkBuilder =
  (lib: typeof CardanoSerializationLib) =>
  (
    inputs: TransactionUnspentOutput[],
    outputs: TransactionOutput[],
    feeConfig: FeeConfig
  ) => {
    let configBuilder = lib.TransactionBuilderConfigBuilder.new()
      .fee_algo(feeConfig.linearFee)
      .max_tx_size(feeConfig.maxTxSize)
      .key_deposit(feeConfig.keyDeposit)
      .max_value_size(feeConfig.maxValSize)
      .pool_deposit(feeConfig.poolDepsit);

    if (feeConfig.dataCost) {
      configBuilder = configBuilder.coins_per_utxo_byte(
        feeConfig.dataCost.coins_per_byte()
      );
    } else {
      configBuilder = configBuilder.coins_per_utxo_word(
        feeConfig.coinsPerUtxoWord
      );
    }

    const txBuilder = lib.TransactionBuilder.new(configBuilder.build());

    inputs.forEach((utxo) =>
      txBuilder.add_input(
        utxo.output().address(),
        utxo.input(),
        utxo.output().amount()
      )
    );
    outputs.forEach((output) => {
      txBuilder.add_output(output);
    });
    return txBuilder;
  };

export function validUTxOs(
  myUtxos: TransactionUnspentOutput[],
  theirUtxos: TransactionUnspentOutput[]
): boolean {
  const eq = (
    input1: CardanoSerializationLib.TransactionInput,
    input2: CardanoSerializationLib.TransactionInput
  ) => {
    const sameTx =
      input1.transaction_id().to_bech32("test") ===
      input2.transaction_id().to_bech32("test");
    const sameIndex = input1.index() === input2.index();
    return sameTx && sameIndex;
  };

  return !Util.List.hasIntersection<TransactionUnspentOutput>((u1, u2) =>
    eq(u1.input(), u2.input())
  )(myUtxos, theirUtxos);
}

/**
 * Edge cases:
 *
 *
 *
 * @param feeConfig
 * @param commission
 * @param myOffer
 * @param theirOffer
 * @param ttl the aggreed upon ttl
 * @returns
 */
export const constructTxBuilder =
  (
    lib: typeof CardanoSerializationLib,
    lib2: typeof CardanoSerializationLibOld
  ) =>
  (
    feeConfig: FeeConfig,
    commission: Commission | undefined,
    myOffer: OfferParams,
    theirOffer: OfferParams,
    ttl: number
  ) => {
    // Check that there is no overlapp in the UTxO set
    // If there is an overlapp some shenanigans are going on

    if (!validUTxOs(myOffer.utxos, theirOffer.utxos)) {
      throw Error("Can not build transaction with incompatible UTxOs");
    }

    // outputs
    const outputs: TransactionOutput[] = [];

    // Commission
    if (commission) {
      const totalCommission = commission.commissionFromMe.checked_add(
        commission.commissionFromThem
      );
      const commissionUtxO = lib.TransactionOutput.new(
        commission.commissionAddress,
        lib.Value.new(totalCommission)
      );
      outputs.push(commissionUtxO);
    }

    // What I should receive
    const whatIRecieve = outputSelection(lib, lib2)(
      myOffer.address,
      theirOffer.value,
      feeConfig.coinsPerUtxoWord,
      feeConfig.dataCost
    );
    const extraINeedToAdd = sumOutputs(lib)(whatIRecieve).checked_sub(
      theirOffer.value
    );
    whatIRecieve.forEach((output) => {
      outputs.push(output);
    });

    // What they should receive
    const whatTheyRecieve = outputSelection(lib, lib2)(
      theirOffer.address,
      myOffer.value,
      feeConfig.coinsPerUtxoWord,
      feeConfig.dataCost
    );
    const extraTheyNeedToAdd = sumOutputs(lib)(whatTheyRecieve).checked_sub(
      myOffer.value
    );
    whatTheyRecieve.forEach((output) => {
      outputs.push(output);
    });

    let estimated_min_fee = mkBuilder(lib)([], outputs, feeConfig).min_fee(); //min_fee(mkFakeTransaction([], outputs, feeConfig), feeConfig.linearFee)

    // Since integer division rounds down we must add 1 to make sure that
    // we are above minimum fee
    const one = lib.BigNum.from_str("1");
    const half = lib.BigNum.from_str("2");
    let estimated_half_fee = lib.Value.new(
      BigNumExtra.divideBy(lib)(estimated_min_fee, half).checked_add(one)
    );

    // Each time we fail to cover everything we will add 1 ADA
    const min_value_increase = lib.Value.new(lib.BigNum.from_str("1000000"));

    // This is the min value I have to put in!
    let valueINeedToProcure = myOffer.value.checked_add(extraINeedToAdd);
    let valueTheyNeedToProcure =
      theirOffer.value.checked_add(extraTheyNeedToAdd);

    if (commission) {
      valueINeedToProcure = valueINeedToProcure.checked_add(
        lib.Value.new(commission.commissionFromMe)
      );
      valueTheyNeedToProcure = valueTheyNeedToProcure.checked_add(
        lib.Value.new(commission.commissionFromThem)
      );
    }

    let thereAreStillUTXOs = true;
    let iterations = 0;

    while (thereAreStillUTXOs && iterations < 100) {
      let myInputs: TransactionUnspentOutput[] = [];
      try {
        myInputs = inputSelection(lib)(
          valueINeedToProcure.checked_add(estimated_half_fee),
          myOffer.utxos
        );
      } catch (err: any) {
        if (instanceOfInsufficientFundsError(err)) {
          throw err.setBlame("You");
        }
      }
      const myInputValue = sumUtxos(lib)(myInputs);

      // Add inputs to cover their outputs + fee + commission
      let theirInputs: TransactionUnspentOutput[] = [];
      try {
        theirInputs = inputSelection(lib)(
          valueTheyNeedToProcure.checked_add(estimated_half_fee),
          theirOffer.utxos
        );
      } catch (err: any) {
        if (instanceOfInsufficientFundsError(err)) {
          throw err.setBlame("They");
        }
      }
      const theirInputValue = sumUtxos(lib)(theirInputs);

      // Now we need to pay our network fee + send back any additional funds in the UTxO:s to the original owners

      // Change to get back (not accounting for fees)
      let myChangeEstimate = myInputValue
        .checked_sub(myOffer.value)
        .checked_sub(estimated_half_fee)
        .checked_sub(extraINeedToAdd);
      let theirChangeEstimate = theirInputValue
        .checked_sub(theirOffer.value)
        .checked_sub(estimated_half_fee)
        .checked_sub(extraTheyNeedToAdd);

      if (commission) {
        myChangeEstimate = myChangeEstimate.checked_sub(
          lib.Value.new(commission.commissionFromMe)
        );
        theirChangeEstimate = theirChangeEstimate.checked_sub(
          lib.Value.new(commission.commissionFromThem)
        );
      }

      // We not construct the change (which is most likely incorrect for a few iterations of the loop)
      const myUtxosBack: TransactionOutput[] = outputSelection(lib, lib2)(
        myOffer.address,
        myChangeEstimate,
        feeConfig.coinsPerUtxoWord,
        feeConfig.dataCost
      );
      const theirUtxosBack: TransactionOutput[] = outputSelection(lib, lib2)(
        theirOffer.address,
        theirChangeEstimate,
        feeConfig.coinsPerUtxoWord,
        feeConfig.dataCost
      );

      //Since we need to cover the min UTxO amount we might overflow
      const myValueBack = sumOutputs(lib)(myUtxosBack);
      const theirValueBack = sumOutputs(lib)(theirUtxosBack);

      if (myChangeEstimate.coin().compare(myValueBack.coin()) !== 0) {
        valueINeedToProcure =
          valueINeedToProcure.checked_add(min_value_increase);
        thereAreStillUTXOs = myInputs.length <= myOffer.utxos.length;
      }

      if (theirChangeEstimate.coin().compare(theirValueBack.coin()) !== 0) {
        valueTheyNeedToProcure =
          valueTheyNeedToProcure.checked_add(min_value_increase);
        thereAreStillUTXOs = theirInputs.length <= theirOffer.utxos.length;
      }

      const inputValue = myInputValue.checked_add(theirInputValue);
      const outputValue = sumOutputs(lib)(outputs)
        .checked_add(sumOutputs(lib)(myUtxosBack))
        .checked_add(sumOutputs(lib)(theirUtxosBack));
      let fee = estimated_half_fee.checked_add(estimated_half_fee);

      const txBuilder = mkBuilder(lib)(
        myInputs.concat(theirInputs),
        outputs.concat(myUtxosBack).concat(theirUtxosBack),
        feeConfig
      );
      txBuilder.set_fee(fee.coin());
      txBuilder.set_ttl(ttl);

      // Re-estimate fee
      estimated_min_fee = txBuilder.min_fee(); //min_fee(mkFakeTransaction([], outputs, feeConfig), feeConfig.linearFee)
      estimated_half_fee = lib.Value.new(
        BigNumExtra.divideBy(lib)(estimated_min_fee, half).checked_add(one)
      );
      fee = estimated_half_fee.checked_add(estimated_half_fee);

      // If everything checks out we build the real tx
      if (ValueExtra.eq(inputValue, outputValue.checked_add(fee))) {
        // This set the tx to be valid for roughly 10 minutes
        return txBuilder;
      }

      iterations = iterations + 1;
    }

    throw new Error("Not enough inputs to cover Outputs requirement");
  };

export const sumOutputs =
  (lib: typeof CardanoSerializationLib) => (outputs: TransactionOutput[]) => {
    let val = lib.Value.new(lib.BigNum.zero());
    outputs.forEach((output) => {
      val = val.checked_add(output.amount());
    });
    return val;
  };

export function instanceOfInsufficientFundsError(
  object: any
): object is InsufficientFundsError {
  return "setBlame" in object;
}

export interface InsufficientFundsError {
  setBlame(blame: "You" | "They"): InsufficientFundsError;
}

export class InsufficientAdaError
  extends Error
  implements InsufficientFundsError
{
  required: BigNum;
  found: BigNum;
  blame?: "You" | "They";
  constructor(required: BigNum, found: BigNum, blame?: "You" | "They") {
    let msg = blame ? blame : "";
    msg += " could not cover required Lovelace amount\n";
    msg += "required:  " + required.to_str() + "\n";
    msg += "found:     " + found.to_str();
    super(msg);

    this.required = required;
    this.found = found;
    this.blame = blame;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InsufficientAdaError.prototype);
  }

  setBlame(blame: "You" | "They") {
    return new InsufficientAdaError(this.required, this.found, blame);
  }
}

export class InsufficientNativeAssetError
  extends Error
  implements InsufficientFundsError
{
  scriptHash: ScriptHash;
  assetName: AssetName;
  required: BigNum;
  found: BigNum;
  blame?: "You" | "They";

  constructor(
    scriptHash: ScriptHash,
    assetName: AssetName,
    required: BigNum,
    found: BigNum,
    blame?: "You" | "They"
  ) {
    let msg = blame ? blame : "";
    msg += "could not cover required amount for native asset\n";
    msg += "hash:      " + scriptHash.to_bech32("script") + "\n";
    msg +=
      "assetName: " + Extra.hexDecode(Extra.toHex(assetName.name())) + "\n";
    msg += "required:  " + required.to_str() + "\n";
    msg += "found:     " + found.to_str();
    super(msg);

    this.scriptHash = scriptHash;
    this.assetName = assetName;
    this.required = required;
    this.found = found;
    this.blame = blame;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InsufficientNativeAssetError.prototype);
  }

  setBlame(blame: "You" | "They") {
    return new InsufficientNativeAssetError(
      this.scriptHash,
      this.assetName,
      this.required,
      this.found,
      blame
    );
  }
}

/**
 * Choose UTxOs so as to cover the given value.
 *
 * Some related reading about coin selection:
 * https://github.com/cardano-foundation/CIPs/blob/master/CIP-0002/README.md
 *
 *
 * @param value
 * @param utxos
 */
export const inputSelection =
  (lib: typeof CardanoSerializationLib) =>
  (value: Value, inputs: TransactionUnspentOutput[]) => {
    let valueTaken = lib.Value.new(lib.BigNum.zero());

    const adaRequired = value.coin();
    let adaTaken = lib.BigNum.zero();
    const takenUtxos: TransactionUnspentOutput[] = [];
    let availableUtxos: TransactionUnspentOutput[] = inputs.slice(); //.sort((left, right) => left.output().amount().compare(right.output().amount()))

    // We go through all native assets and add enough to cover the outputs (or we through error)
    const nativeAssets = value.multiasset();
    if (nativeAssets !== undefined) {
      const scripts = nativeAssets.keys();
      for (let scriptIndex = 0; scriptIndex < scripts.len(); scriptIndex++) {
        const scriptHash = scripts.get(scriptIndex);
        const assets = nativeAssets.get(scriptHash);
        if (assets !== undefined) {
          const assetNames = assets.keys();
          for (
            let assetNameIndex = 0;
            assetNameIndex < assetNames.len();
            assetNameIndex++
          ) {
            const assetName = assetNames.get(assetNameIndex);
            const requiredAmount = assets.get(assetName);
            if (requiredAmount !== undefined) {
              // Now we will select UTxOs so as to cover this native asset
              const amountRequired = ValueExtra.lookup(lib)(
                scriptHash,
                assetName,
                value
              );
              let amountTaken = ValueExtra.lookup(lib)(
                scriptHash,
                assetName,
                valueTaken
              );
              const availableUtxosWithAsset = filterUtxosForAsset(lib)(
                scriptHash,
                assetName,
                availableUtxos
              );
              while (amountTaken.compare(amountRequired) < 0) {
                const utxo = availableUtxosWithAsset.pop(); // Takes from the end of the list
                if (utxo !== undefined) {
                  adaTaken = adaTaken.checked_add(
                    utxo.output().amount().coin()
                  );
                  amountTaken = amountTaken.checked_add(
                    lookupAssetInUtxo(lib)(scriptHash, assetName, utxo)
                  );
                  takenUtxos.push(utxo);
                  availableUtxos = availableUtxos.filter((u) => u !== utxo);
                  valueTaken = valueTaken.checked_add(utxo.output().amount());
                } else {
                  throw new InsufficientNativeAssetError(
                    scriptHash,
                    assetName,
                    amountRequired,
                    amountTaken
                  );
                }
              }
            }
          }
        }
      }
    }
    availableUtxos.sort((lhs, rhs) =>
      lhs.output().amount().coin().compare(rhs.output().amount().coin())
    );
    // Add more ada if necessary
    while (adaTaken.compare(adaRequired) < 0) {
      const utxo = availableUtxos.pop();
      if (utxo !== undefined) {
        adaTaken = adaTaken.checked_add(utxo.output().amount().coin());
        availableUtxos = availableUtxos.filter((u) => u !== utxo);
        takenUtxos.push(utxo);
      } else {
        throw new InsufficientAdaError(adaRequired, adaTaken);
      }
    }

    return takenUtxos;
  };

const filterUtxosForAsset =
  (lib: typeof CardanoSerializationLib) =>
  (
    scriptHash: ScriptHash,
    assetName: AssetName,
    utxos: TransactionUnspentOutput[]
  ) => {
    return utxos
      .filter(
        (utxo) => !lookupAssetInUtxo(lib)(scriptHash, assetName, utxo).is_zero()
      )
      .sort((lhs, rhs) =>
        lookupAssetInUtxo(lib)(scriptHash, assetName, lhs).compare(
          lookupAssetInUtxo(lib)(scriptHash, assetName, rhs)
        )
      );
    // we sort so that the largest one is at the end. This makes it easy to use
    // .pop()
  };

export const lookupAssetInUtxo =
  (lib: typeof CardanoSerializationLib) =>
  (
    scriptHash: ScriptHash,
    assetName: AssetName,
    utxo: TransactionUnspentOutput
  ) => {
    const amount = utxo
      .output()
      .amount()
      .multiasset()
      ?.get(scriptHash)
      ?.get(assetName);
    return amount ? amount : lib.BigNum.zero();
  };

export const sumUtxos =
  (lib: typeof CardanoSerializationLib) =>
  (utxos: TransactionUnspentOutput[]) => {
    let total = lib.Value.new(lib.BigNum.zero());
    utxos.forEach((utxo) => {
      total = total.checked_add(utxo.output().amount());
    });
    return total;
  };

export const outputSelection =
  (
    lib: typeof CardanoSerializationLib,
    lib2: typeof CardanoSerializationLibOld
  ) =>
  (
    reciever: Address,
    value: Value,
    coinsPerUtxoWord: BigNum,
    dataCost?: DataCost
  ) => {
    const outputs: TransactionOutput[] = [];

    if (ValueExtra.eq(value, lib.Value.zero())) {
      return outputs;
    }

    let val = lib.Value.new(value.coin());

    let min_ada = lib.BigNum.zero();

    // Support both the old and new way of computing the cost!
    // when vasil happens you can remove the old way!
    if (dataCost) {
      const fakeOutput = lib.TransactionOutput.new(
        TestUtil.mkAddress(lib)(0),
        value
      );
      min_ada = lib.min_ada_for_output(fakeOutput, dataCost);
    } else {
      // We must convert the values to instances from the old version...
      const valueOld = lib2.Value.from_bytes(value.to_bytes());
      const coinsPerUtxoWordOld = lib2.BigNum.from_bytes(
        coinsPerUtxoWord.to_bytes()
      );
      const min_ada_old = lib2.min_ada_required(
        valueOld,
        false,
        coinsPerUtxoWordOld
      );
      min_ada = lib.BigNum.from_bytes(min_ada_old.to_bytes());
    }

    if (value.coin().compare(min_ada) < 0) {
      val = lib.Value.new(min_ada);
    }

    const multiAsset = value.multiasset();
    if (multiAsset !== undefined) {
      val.set_multiasset(multiAsset);
    }

    outputs.push(lib.TransactionOutput.new(reciever, val));

    return outputs;
  };

/**
 * TODO: Add validation to make sure the address is correct!
 *
 * @param netId whether we are on the testnet or mainnet
 * @returns the commission we take for building the tx - undfined if on the testnet
 */
export const mkCommission =
  (lib: typeof CardanoSerializationLib) => (netId: NetworkID) => {
    if (netId === "Testnet") {
      return undefined;
    }

    const comAd = lib.Address.from_bech32(
      "addr1q9hfwa5d3mqhey7e0uf0u539d4p5x802awa4rc2vlvtqlhf82szk0twjcev7qlssvmffaket0fx4sf5jlhl8qcwm30hq3n8yeh"
    );

    return {
      commissionFromMe: lib.BigNum.from_str("1000000"),
      commissionFromThem: lib.BigNum.from_str("1000000"),
      commissionAddress: comAd,
    };
  };

export const mkFeeConfig =
  (lib: typeof CardanoSerializationLib) =>
  (networkID: NetworkID, networkParameters: NetworkParameters): FeeConfig => {
    return {
      linearFee: lib.LinearFee.new(
        lib.BigNum.from_str(networkParameters.linearFee.minFeeA),
        lib.BigNum.from_str(networkParameters.linearFee.minFeeB)
      ),
      minUtxo: lib.BigNum.from_str(networkParameters.minUtxo),
      poolDepsit: lib.BigNum.from_str(networkParameters.poolDeposit),
      keyDeposit: lib.BigNum.from_str(networkParameters.keyDeposit),
      maxValSize: networkParameters.maxValSize,
      maxTxSize: networkParameters.maxTxSize,
      // Decide the correct cost model depending on the which version of the network!
      // Change to only use the new one when vasil hits mainnet
      coinsPerUtxoWord: lib.BigNum.from_str(networkParameters.coinsPerUtxoWord),
      dataCost:
        networkID === "Mainnet"
          ? lib.DataCost.new_coins_per_word(
              lib.BigNum.from_str(networkParameters.coinsPerUtxoWord)
            )
          : lib.DataCost.new_coins_per_byte(
              lib.BigNum.from_str(networkParameters.coinsPerUtxoByte)
            ),
    };
  };

export type NetworkParameters = {
  linearFee: {
    minFeeA: string;
    minFeeB: string;
  };
  minUtxo: string;
  poolDeposit: string;
  keyDeposit: string;
  coinsPerUtxoWord: string;
  coinsPerUtxoByte: string;
  maxValSize: number;
  priceMem: number;
  priceStep: number;
  maxTxSize: number;
  slot: number;
};

async function initTx(netId: NetworkID): Promise<NetworkParameters> {
  const blockFrostAPI = new BlockFrostAPI(netId);
  const latest_block = await blockFrostAPI.blocksLatest();
  if (Types.isError(latest_block)) {
    throw latest_block;
  }
  const p = await blockFrostAPI.epochsParameters(latest_block.epoch);

  if (Types.isError(p)) {
    throw p;
  }
  return {
    linearFee: {
      minFeeA: p.min_fee_a.toString(),
      minFeeB: p.min_fee_b.toString(),
    },
    minUtxo: p.min_utxo,
    poolDeposit: p.pool_deposit,
    keyDeposit: p.key_deposit,
    coinsPerUtxoWord: p.coins_per_utxo_word, // Set to the old value if new value exists
    coinsPerUtxoByte: p.coins_per_utxo_size,
    maxValSize: parseInt(p.max_val_size),
    priceMem: p.price_mem,
    priceStep: p.price_step,
    maxTxSize: p.max_tx_size,
    slot: latest_block.slot,
  };
}
