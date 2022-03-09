import { VStack } from "@chakra-ui/react";
import {
  AssetName,
  BigNum,
  ScriptHash,
} from "@emurgo/cardano-serialization-lib-browser";
import { SelectedAsset } from "./Types";
import * as CardanoAsset from "../../Cardano/Asset";
import Asset from "../../components/Asset";

type AssetListProps = {
  isLocked: boolean;
  isEditable: boolean;
  assets: SelectedAsset[];
  onAdaChange: (v: BigNum) => void;
  onAddNativeAsset: (
    hash: ScriptHash,
    assetName: AssetName,
    amount: BigNum
  ) => void;
};

export default function AssetList(props: AssetListProps) {
  return (
    <VStack>
      {props.assets.map((selectedAsset) => {
        if (!props.isEditable) {
          return (
            <Asset
              isLocked={props.isLocked}
              maxValue={selectedAsset.maxValue}
              asset={selectedAsset}
              key={CardanoAsset.makeID(selectedAsset)}
            />
          );
        } else {
          return (
            <Asset
              isLocked={props.isLocked}
              maxValue={selectedAsset.maxValue}
              asset={selectedAsset}
              onValueSubmit={(value: BigNum) => {
                if (selectedAsset.kind === "ADA") {
                  props.onAdaChange(value);
                } else {
                  const hash = selectedAsset.metadata.hash;
                  const assetName = selectedAsset.metadata.assetName;
                  props.onAddNativeAsset(hash, assetName, value);
                }
              }}
              onDelete={() => {
                if (selectedAsset.kind === "ADA") {
                  props.onAdaChange(BigNum.zero());
                } else {
                  props.onAddNativeAsset(
                    selectedAsset.metadata.hash,
                    selectedAsset.metadata.assetName,
                    BigNum.zero()
                  );
                }
              }}
              key={CardanoAsset.makeID(selectedAsset)}
            />
          );
        }
      })}
    </VStack>
  );
}
