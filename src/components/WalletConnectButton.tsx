import { Button, useDisclosure } from "@chakra-ui/react";
import WalletSelector from "./WalletSelector";

export default function WalletConnectButton(props: { text?: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button colorScheme="primary" onClick={onOpen}>
        {props.text ? props.text : "CONNECT"}
      </Button>
      <WalletSelector isOpen={isOpen} onClose={onClose} />
    </>
  );
}
