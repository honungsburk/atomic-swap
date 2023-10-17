import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import * as CardanoAsset from "../../Cardano/Asset";

export type SelectedAsset = {
  asset: CardanoAsset.Asset;
  maxValue: BigNum;
};
