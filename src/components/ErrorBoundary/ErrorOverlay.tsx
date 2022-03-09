import {
  VStack,
  Text,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import CopyCard from "../CopyCard";
import * as Icons from "../Icons";

export default function ErrorOverlay(props: { error: any; title: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <IconButton
        variant={"ghost"}
        colorScheme="failure"
        aria-label="Unmute"
        icon={<Icons.Error />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{props.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={2}>
              <VStack spacing={1}>
                <Text fontWeight={"bold"} maxW={300} textAlign={"center"}>
                  Please, report the error by copying the error below and post
                  it to the appopriate channel on discord.
                </Text>
                <Text fontSize={12} textAlign={"center"}>
                  (Discord link is at the bottom of the page)
                </Text>
              </VStack>
              <CopyCard value={props.error}></CopyCard>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
