import {
  Center,
  HStack,
  Button,
  Link,
  Flex,
  Box,
  Spacer,
  Image,
  Text,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
  ModalBody,
  ModalHeader,
  Modal,
  useDisclosure,
  Icon,
  IconButton,
  useBreakpointValue,
  Alert,
  VStack,
  AlertIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  useInterval,
} from "@chakra-ui/react";
import { Link as ReachLink, Outlet } from "react-router-dom";
import { ChannelState } from "./Network/Channel";
import * as NetworkSession from "./Network/Session";
import * as Icons from "./components/Icons";
import React from "react";
import WalletSelector from "./components/WalletSelector";
import ToolTip from "./components/ToolTip";
import BlockFrostAPI from "./API/BlockFrost/BlockFrostAPI";
import * as BlockFrostTypes from "./API/BlockFrost/Types";
import ChatBar from "./components/ChatBar";
import ComponentErrorBoundary from "./components/ErrorBoundary/ComponentErrorBoundary";
import AtomicSwapLogo from "./components/Logo";
import { usePWAInstall } from "./Hooks/PWA";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";
import * as Store from "src/Store";

export default function Layout() {
  const layout: "vertical" | "horizontal" | undefined = useBreakpointValue({
    base: "vertical",
    sm: "horizontal",
  });
  const [isHealthy, setIsHealth] = React.useState<boolean>(true);
  const channelState = Store.ChannelState.use((s) => s.channelState);
  const session = Store.Session.use((s) => s.session);
  const wallet = Store.Wallet.use((state) => state.wallet);

  const checkHealth = async () => {
    try {
      if (wallet !== undefined) {
        const networkId = await wallet.getNetworkId();
        const API = new BlockFrostAPI(networkId);
        const health = await API.health();
        if (BlockFrostTypes.isHealth(health)) {
          setIsHealth(health.is_healthy);
        } else {
          setIsHealth(false);
        }
      }
    } catch (err: any) {
      setIsHealth(false);
      return;
    }
  };

  useInterval(checkHealth, 30000);

  React.useEffect(() => {
    checkHealth();
  }, [wallet]);

  let chatbar = <></>;

  if (channelState === "Connected" && session !== undefined) {
    if (layout === "horizontal") {
      chatbar = (
        <Box pos="fixed" bottom="4" right="8" zIndex={1}>
          <ComponentErrorBoundary>
            <ChatBar size={"md"}></ChatBar>
          </ComponentErrorBoundary>
        </Box>
      );
    } else {
      chatbar = (
        <Center pos="fixed" zIndex={1} width={"100%"} bottom="4">
          <ComponentErrorBoundary>
            <ChatBar size={"sm"}></ChatBar>
          </ComponentErrorBoundary>
        </Center>
      );
    }
  }

  return (
    <Flex direction="column" minH="100vh">
      <VStack w="full">
        {isHealthy ? <></> : <BackendIsDown />}
        <Box w="full">
          <Header channelState={channelState} />
        </Box>
      </VStack>
      <Outlet />
      <Spacer />
      <Footer />
      {chatbar}
    </Flex>
  );
}

function BackendIsDown() {
  return (
    <Alert status="error" variant="solid">
      <AlertIcon />
      The server is down! Atomic Swap will not function properly.
    </Alert>
  );
}

function Header(props: {
  session?: NetworkSession.Session;
  channelState: ChannelState;
  lib?: typeof CardanoSerializationLib;
}) {
  const layout: "vertical" | "horizontal" | undefined = useBreakpointValue({
    base: "vertical",
    sm: "horizontal",
  });

  if (layout === "horizontal") {
    return (
      <Flex p={2} align={"center"}>
        <Logo></Logo>
        <Spacer />
        <HStack>
          <SessionStatus status={props.channelState} />
          <NavBar status={props.channelState} lib={props.lib} />
        </HStack>
      </Flex>
    );
  } else {
    return (
      <Center p={2}>
        <VStack>
          <NavBar status={props.channelState} lib={props.lib} />
          <SessionStatus status={props.channelState} />
        </VStack>
      </Center>
    );
  }
}

function Logo() {
  return (
    <Center>
      <Link as={ReachLink} to="/home">
        <AtomicSwapLogo boxSize="48px" />
      </Link>
    </Center>
  );
}

function NavBar(props: {
  status: ChannelState;
  lib?: typeof CardanoSerializationLib;
}) {
  const dynamic: "Large" | "Small" | undefined = useBreakpointValue({
    base: "Small",
    sm: "Large",
  });

  let spacing = 4;
  let px = 4;
  let py = 2;
  const pxE = dynamic === "Small" ? 0 : undefined;

  if (dynamic === "Large") {
    spacing = 4;
    px = 8;
    py = 3;
  }

  const bgColor = useColorModeValue("accent.500", "accentDarkMode.700");

  return (
    <HStack bgColor={bgColor} spacing={spacing} px={px} py={py} rounded={32}>
      <Info px={pxE} />
      <Trade px={pxE} channelState={props.status} />
      <Wallet px={pxE} />
    </HStack>
  );
}
function SessionStatus(props: { status: ChannelState }) {
  const [hovering, setHovering] = React.useState<boolean>(false);
  const { isOpen, onToggle } = useDisclosure();
  const sizes = [5];
  const fontSizes = [12];

  let bgColor = "secondary";
  let hoverColor = "secondary.600";

  if (props.status === "Destroyed") {
    bgColor = "failure";
    hoverColor = "failure.600";
  } else if (props.status === "Connected") {
    bgColor = "success";
    hoverColor = "success.600";
  }

  return (
    <ToolTip label={"The state of your trade connection"} isOpen={hovering}>
      <Box>
        <Center
          width={"max-content"}
          minWidth={sizes}
          height={sizes}
          rounded={20}
          bgColor={bgColor + ".500"}
          cursor={"pointer"}
          _hover={{ bgColor: hoverColor }}
          _active={{
            bg: bgColor + ".700",
            transform: "scale(0.98)",
          }}
          onClick={() => onToggle()}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {hovering || !isOpen ? (
            <Text color="white" mx={2} cursor={"pointer"} fontSize={fontSizes}>
              {props.status}
            </Text>
          ) : (
            <></>
          )}
        </Center>
      </Box>
    </ToolTip>
  );
}

function Info(props: { px?: number }) {
  return (
    <Box>
      <Menu>
        <MenuButton
          px={props.px}
          aria-label="Info"
          variant="ghost"
          as={Button}
          leftIcon={<Icons.INFO />}
          rightIcon={<Icons.CaretDown />}
        >
          INFO
        </MenuButton>
        <MenuList>
          <Link as={ReachLink} to="/faq">
            <MenuItem icon={<Icons.FAQ />}>FAQ</MenuItem>
          </Link>
          <Link href="https://www.youtube.com/watch?v=XdE0aK5ypWM" isExternal>
            <MenuItem icon={<Icons.Youtube />}>How to video</MenuItem>
          </Link>
          <Link as={ReachLink} to="/whitepaper">
            <MenuItem icon={<Icons.WhitePaper />}>White Paper</MenuItem>
          </Link>
          <Link as={ReachLink} to="/changelog">
            <MenuItem icon={<Icons.ChangeLog />}>Changelog</MenuItem>
          </Link>
        </MenuList>
      </Menu>
    </Box>
  );
}

function Trade(props: { px?: number; channelState: ChannelState }) {
  let text = "TRADE";
  if (props.channelState === "Connected") {
    text = "REJOIN";
  }

  return (
    <Center>
      <Button
        px={props.px}
        as={ReachLink}
        to="/session"
        variant="ghost"
        leftIcon={<Icons.Trade />}
      >
        {text}
      </Button>
    </Center>
  );
}

function mkWalletIcon(src?: string) {
  return src === undefined ? (
    <Icon fontSize={24} as={Icons.Wallet} />
  ) : (
    <Image width={"32px"} src={src}></Image>
  );
}

function Wallet(props: { px?: number }) {
  const wallet = Store.Wallet.use((state) => state.wallet);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [canInstallPWA, installPWA] = usePWAInstall();

  return (
    <Box>
      <Menu>
        <MenuButton
          px={props.px}
          aria-label="User Settings"
          variant="ghost"
          as={IconButton}
          icon={mkWalletIcon(wallet?.icon())}
        >
          INFO
        </MenuButton>
        <MenuList>
          <Link as={ReachLink} to="/settings">
            <MenuItem icon={<Icons.Settings />}>Settings</MenuItem>
          </Link>
          <MenuItem icon={<Icons.Wallet />} onClick={onOpen}>
            Connect Wallet
          </MenuItem>
          {canInstallPWA ? (
            <MenuItem icon={<Icons.Install />} onClick={installPWA}>
              Install
            </MenuItem>
          ) : (
            <></>
          )}
        </MenuList>
      </Menu>
      <WalletSelector isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

function Footer() {
  const layout: "vertical" | "horizontal" | undefined = useBreakpointValue({
    base: "vertical",
    sm: "horizontal",
  });

  const iconColor = useColorModeValue("black", "white");

  return (
    <Box
      as="footer"
      role="contentinfo"
      mx="auto"
      maxW="7xl"
      pt="4"
      pb={layout === "vertical" ? "20" : "4"}
      px={{ base: "4", md: "8" }}
    >
      <HStack>
        <Link href="https://github.com/honungsburk/atomic-swap" target="_blank">
          <Icon w={8} h={8} color={iconColor} as={Icons.Github} />
        </Link>
        <Link href="https://discord.gg/ZqpN4TuJ6a" target="_blank">
          <Icon w={8} h={8} color={iconColor} as={Icons.Discord} />
        </Link>
        <Link href="https://twitter.com/_atomicswap" target="_blank">
          <Icon w={8} h={8} color={iconColor} as={Icons.Twitter} />
        </Link>
      </HStack>
    </Box>
  );
}

function TermsOfUse() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box>
      <Button mt={3} onClick={onOpen} variant="link">
        Terms of Use
      </Button>

      <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Terms of Use</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              By using this product you accept that the creator of this product,
              Frank Hampus Weslien, is not responsible for any loss of funds due
              to any reason. It is the responsibility of the user to verify the
              correctness of the transaction before signing it with their
              wallet.
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
