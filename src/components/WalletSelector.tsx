import {
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spacer,
  VStack,
  Text,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import * as CIP30 from "cardano-web-bridge-wrapper/lib/CIP30";
import { BasicWallet } from "cardano-web-bridge-wrapper/lib/BasicWallet";
import { Ghost } from "./ChakraKawaii";
import colors from "../Theme/colors";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";
import * as Store from "src/Store";

export default function WalletSelector(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const colorMode = useColorModeValue(
    { bgColor: "background.light" },
    { bgColor: "background.dark" }
  );

  //TODO: this is inefficent... don't want to redo this all the time
  const walletChoices: JSX.Element[] = Store.Wallet.injectedAPIs().map(
    (api) => <WalletChoice key={api.name} api={api} onClose={props.onClose} />
  );

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent bgColor={colorMode.bgColor}>
        <ModalHeader>Choose Wallet</ModalHeader>
        <ModalCloseButton colorScheme={"whiteAlpha"} />
        <ModalBody>
          <VStack width={"fill"}>
            {walletChoices.length > 0 ? walletChoices : <NoWallet />}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function NoWallet() {
  return (
    <VStack>
      <Ghost mood="shocked" color={colors.characters.ghost}></Ghost>
      <Text>I couldn&apos;t find your wallet!</Text>
    </VStack>
  );
}

function WalletChoice(props: {
  api: CIP30.InitalAPI<any>;
  onClose: () => void;
}) {
  const colorMode = useColorModeValue(
    { bgColor: "accent.500", bgHoverColor: "accent.500" },
    { bgColor: "accentDarkMode.500", bgHoverColor: "accentDarkMode.400" }
  );
  const injectWallet = Store.Wallet.use((state) => state.inject);

  return (
    <Flex
      px={8}
      py={4}
      bgColor={colorMode.bgColor}
      _hover={{
        bgColor: colorMode.bgHoverColor,
      }}
      cursor={"pointer"}
      onClick={async () => {
        const fullAPI = await props.api.enable();
        injectWallet(
          new BasicWallet(props.api, fullAPI, CardanoSerializationLib)
        );
        props.onClose();
      }}
      width={"full"}
      rounded={8}
    >
      <Center>
        <Text fontSize={32} fontWeight={"bold"}>
          {props.api.name}
        </Text>
      </Center>
      <Spacer></Spacer>
      <Image width={"40px"} src={props.api.icon}></Image>
    </Flex>
  );
}
