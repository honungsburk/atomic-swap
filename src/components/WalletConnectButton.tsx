import { Button, useDisclosure } from "@chakra-ui/react";
import { BasicWallet } from "../Cardano/CIP30/Wallet";
import WalletSelector from "./WalletSelector";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";

export default function WalletConnectButton(props: {
  text?: string;
  onWalletChange: (wallet: BasicWallet) => void;
  lib: typeof CardanoSerializationLib;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button colorScheme="primary" onClick={onOpen}>
        {props.text ? props.text : "CONNECT"}
      </Button>
      <WalletSelector
        lib={props.lib}
        onWalletChange={props.onWalletChange}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
}
