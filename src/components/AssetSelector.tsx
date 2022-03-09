import {
  Input,
  InputRightElement,
  CloseButton,
  InputGroup,
  VStack,
  Box,
  Text,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { FixedSizeList as List } from "react-window";
import * as CardanoUtil from "../Cardano/Util";
import * as CardanoAsset from "../Cardano/Asset";
import AssetMini from "./AssetMini";
import { Ghost } from "react-kawaii";

type AssetSelectorProps = {
  assets: CardanoAsset.Asset[];
  addAsset: (asset: CardanoAsset.Asset) => void;
  isOpen: boolean;
  onClose: () => void;
};

function AssetSelector(props: AssetSelectorProps) {
  const colorMode = useColorModeValue(
    {
      bgColor: "background.light",
    },
    {
      bgColor: "background.dark",
    }
  );
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent bgColor={colorMode.bgColor}>
        <ModalHeader>Add Asset</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <AssetSelectorList
            assets={props.assets}
            addAsset={(asset: CardanoAsset.Asset) => {
              props.addAsset(asset);
              props.onClose();
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function AssetSelectorList(props: {
  assets: CardanoAsset.Asset[];
  addAsset: (asset: CardanoAsset.Asset) => void;
}) {
  const [search, setSearch] = React.useState<string>("");

  const filterAssets = () => {
    return props.assets.filter((asset) => filter(search, asset));
  };

  const assets = filterAssets();

  return (
    <VStack>
      <InputGroup>
        <Input
          mx={"4"}
          value={search}
          size="md"
          placeholder="Search policy, asset, name"
          fontSize="md"
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <InputRightElement mx={"4"}>
          <CloseButton
            size="md"
            aria-label="Reset Search"
            onClick={() => setSearch("")}
          />
        </InputRightElement>
      </InputGroup>
      {assets.length > 0 ? (
        <List
          // outerElementType={CustomScrollbarsVirtualList}
          height={300}
          itemCount={assets.length}
          itemSize={52}
          width={"100%"}
        >
          {({ index, style }: any) => {
            const asset = assets[index];
            return (
              <Box
                style={style}
                display="flex"
                alignItems="center"
                justifyContent="center"
                key={CardanoAsset.makeID(asset)}
              >
                <AssetMini
                  asset={asset}
                  onClick={(asset) => props.addAsset(asset)}
                />
              </Box>
            );
          }}
        </List>
      ) : (
        <Center>
          <VStack>
            <Ghost size={120} mood="ko" color="#E0E4E8" />
            <Text fontWeight="bold" color="black">
              No Assets
            </Text>
          </VStack>
        </Center>
      )}
    </VStack>
  );
}

function filter(search: string, asset: CardanoAsset.Asset): boolean {
  if (search) {
    const matchingDisplayName = asset.metadata.displayName
      .toLowerCase()
      .includes(search.toLowerCase());
    let matchingPolicyID = false;
    let mathcingAssetFingerprint = false;
    if (asset.kind === "NativeAsset") {
      matchingPolicyID = CardanoAsset.policyID(asset).includes(search);
      mathcingAssetFingerprint = CardanoUtil.assetFingerprint(
        asset.metadata.hash,
        asset.metadata.assetName
      )
        .fingerprint()
        .includes(search);
    }
    return matchingDisplayName || matchingPolicyID || mathcingAssetFingerprint;
  } else {
    return true;
  }
}

export default AssetSelector;
