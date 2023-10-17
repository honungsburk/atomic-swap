import * as Asset from "./Asset";
import { describe, it } from "vitest";
import * as Cardano from "@emurgo/cardano-serialization-lib-nodejs";
import * as Util from "./Util";

describe("Asset", () => {
  it("unit must match hash + assetName", ({ expect }) => {
    const asset = Asset.buildNativeAsset(Cardano)(
      Cardano.BigNum.from_str("1"),
      clumsy_valley,
      "Mainnet"
    );
    expect(Asset.unit(asset.metadata.hash, asset.metadata.assetName)).toEqual(
      asset.metadata.unit
    );
  });
});

describe("Unit Parsing", () => {
  it("unit must match hash + assetName", ({ expect }) => {
    const scriptHash = Util.toScriptHash(Cardano)(clumsy_valley.policy_id);
    const assetName = Util.toAssetName(Cardano)("");
    expect(Asset.unit(scriptHash, assetName)).toEqual(clumsy_valley.policy_id);
  });
});

const clumsy_valley = {
  asset:
    "b00041d7dc086d33e0f7777c4fccaf3ef06720543d4ff4e750d8f123436c756d73792056616c6c6579204c616e6420506c6f74202337393538",
  policy_id: "b00041d7dc086d33e0f7777c4fccaf3ef06720543d4ff4e750d8f123",
  asset_name: "436c756d73792056616c6c6579204c616e6420506c6f74202337393538",
  fingerprint: "asset12jc5yhcftnsndzqlf0sdz592wuyly053zahgg8",
  quantity: "1",
  initial_mint_tx_hash:
    "a48383c4e023000eb6cbd6e3a877afc76c659ba9374d5bc8926654b6b0fc0711",
  mint_or_burn_count: 1,
  onchain_metadata: {
    id: "7958",
    rank: "9438",
    biome: "toxic-swamps",
    grass: "5",
    image: [
      "bafybeif37umi6d5ww3vhski26wcnjkvg7esm5gxsnmzatfo56mklklrtme/",
      "final/",
      "ClumsyValleyLandPlot7958_ipfs.svg",
    ],
    items: "7",
    stone: "1",
    project: "Clumsy Valley",
    special: "no",
    terrain: "swamp1",
    lily_pad: "1",
    mediaType: "image/svg+xml",
    side_terrain: "musty",
  },
  onchain_metadata_standard: null,
  onchain_metadata_extra: null,
  metadata: null,
};
