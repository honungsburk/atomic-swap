import {
  Tag,
  Box,
  Spacer,
  Flex,
  VStack,
  HStack,
  Center,
  Text,
  Heading,
  Input,
  Collapse,
  Container,
  TextProps,
  useColorModeValue,
} from "@chakra-ui/react";
import Copy from "../components/Copy";
import React from "react";
import { Link } from "../components/Icons";
import * as ListExtra from "../Util/ListExtra";
import * as MapExtra from "../Util/MapExtra";
import TextLink from "../components/TextLink";
import { useSearchParams } from "react-router-dom";
import { Ghost } from "../components/ChakraKawaii";
import Theme from "../Theme";
import { CaretDown, CaretUp } from "../components/Icons";
import ToolTip from "../components/ToolTip";

export default function FAQ() {
  const [searchParams, setSearchParams] = useSearchParams();
  const _search = searchParams.get("search");
  const search = _search ? _search : "";
  const [toggleMap, setToggleMap] = React.useState<Map<string, boolean>>(
    mkToogleMap(
      faqItems.map((item) => item.question),
      search
    )
  );
  const path = window.location.href.split("?")[0];

  const setSearch = (s: string) => {
    setSearchParams({ search: s });
  };

  const faqItemsPlus: FAQItemProps[] = faqItems.map((item) =>
    mkFAQItemProps(item, toggleMap, setToggleMap, path)
  );

  const filterFAQItems = () => {
    const filter = (item: FAQItemProps) =>
      search
        ? item.question.toLowerCase().includes(search.toLowerCase()) ||
          ListExtra.any(item.tags, (s) =>
            s.toLowerCase().includes(search.toLowerCase())
          )
        : true;
    return faqItemsPlus.filter((item) => filter(item));
  };

  const filteredFAQItems = filterFAQItems();
  return (
    <Container maxW="container.lg" mt={8}>
      <VStack spacing={4}>
        <VStack spacing={4}>
          <Heading fontSize={["6xl", null, null, "8xl"]}>FAQ</Heading>
          <Input
            mx={"4"}
            value={search}
            size="lg"
            placeholder="Search..."
            fontSize="lg"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          ></Input>
        </VStack>
        {filteredFAQItems.length > 0 ? (
          filteredFAQItems.map(FAQItem)
        ) : (
          <VStack>
            <Ghost
              size={240}
              mood="sad"
              color={Theme.colors.characters.ghost}
            ></Ghost>
            <Text>I can&apos;t find it in the FAQ</Text>
          </VStack>
        )}
      </VStack>
    </Container>
  );
}

type FAQItemProps = {
  question: string;
  answer: JSX.Element;
  tags: string[];
  href: string;
  isOpen: boolean;
  onToggle: () => void;
};

function FAQItem(props: FAQItemProps) {
  const colorMode = useColorModeValue(
    { bgColor: "accent.500", bgColorHover: "accent.600" },
    { bgColor: "accentDarkMode.700", bgColorHover: "accentDarkMode.600" }
  );

  const icon = props.isOpen ? (
    <CaretDown fontSize={32} />
  ) : (
    <CaretUp fontSize={32} />
  );

  return (
    <Box
      bg={colorMode.bgColor}
      _hover={{ bg: colorMode.bgColorHover, cursor: "pointer" }}
      rounded={16}
      px={4}
      overflow="hidden"
      width={"100%"}
      key={props.question}
      onClick={props.onToggle}
    >
      <Collapse
        startingHeight={"80px"}
        in={props.isOpen}
        style={{ width: "100%" }}
      >
        <Flex height={"80px"}>
          <HStack>
            <CopyLink link={props.href}></CopyLink>
            <Heading fontSize={["md", "lg", "2xl"]}>{props.question}</Heading>
          </HStack>
          <Spacer />
          <Center>{icon}</Center>
        </Flex>
        {props.answer}
        <Box height={"8px"}></Box>
        <HStack>
          {props.tags.map((tag) => {
            return (
              <Tag size={"sm"} key={tag} variant="solid" colorScheme="teal">
                {tag}
              </Tag>
            );
          })}
        </HStack>
        <Box height={"20px"}></Box>
      </Collapse>
    </Box>
  );
}

function CopyLink(props: { link: string }) {
  const colorMode = useColorModeValue(
    { color: "black", bgColorHover: "accent.700" },
    { color: "white", bgColorHover: "accentDarkMode.400" }
  );
  return (
    <ToolTip label="Copy Link">
      <Box onClick={(e) => e.stopPropagation()}>
        <Copy label={props.link} copy={props.link}>
          <Link p={0} color={colorMode.color} fontSize={32} />
        </Copy>
      </Box>
    </ToolTip>
  );
}

function mkFAQItemProps(
  props: { question: string; answer: JSX.Element; tags: string[] },
  toggleMap: Map<string, boolean>,
  setToggleMap: (v: Map<string, boolean>) => void,
  fullPath: string
): FAQItemProps {
  const isOpen = toggleMap.get(props.question);

  const onToggle = () => {
    // we copy so to be a pure funciton
    const newToggleMap = MapExtra.shallowCopy(toggleMap);
    newToggleMap.set(props.question, !isOpen);
    setToggleMap(newToggleMap);
  };

  return {
    isOpen: isOpen === true, //Tog get rid of undefined values
    onToggle: onToggle,
    href: fullPath + "?search=" + encodeQueryParam(props.question),
    ...props,
  };
}

function encodeQueryParam(question: string): string {
  const noSpace = question.replaceAll(" ", "+");
  return noSpace.replaceAll("?", "");
}

function mkToogleMap(keys: string[], search: string): Map<string, boolean> {
  const ret = new Map<string, boolean>();
  keys.forEach((key) =>
    ret.set(key, encodeQueryParam(key) === encodeQueryParam(search))
  );
  return ret;
}

function FAQText(props: TextProps) {
  return (
    <Text
      fontSize={["md", null, "lg", "xl"]}
      textAlign="left"
      width={"100%"}
      {...props}
    ></Text>
  );
}

const faqItems: { question: string; answer: JSX.Element; tags: string[] }[] = [
  {
    question: "How does Atomic Swap work?",
    answer: (
      <VStack spacing="1">
        <FAQText>
          Cardano allow multiple people to send/receive assets in the same
          transaction. For example, we could have Bob send 1 SpaceBud NFT to
          Alice and in the same transaction have Alice send 1 Clay Nation NFT to
          Bob. This is what Atomic Swap does. It puts what you and your trading
          partner is sending into the same transaction. Meaning that Bob can be
          absolutly sure that if Bob sends his SpaceBud NFT using Atomic Swap he
          will receive Alice&apos;s Clay Nation NFT.
        </FAQText>
        <FAQText>
          You will find a deeper explenation of how Atomic Swap works in the{" "}
          <TextLink href="/whitepaper">white paper</TextLink>.
        </FAQText>
      </VStack>
    ),
    tags: ["Development", "Security"],
  },
  {
    question: "Is Atomic Swap secure?",
    answer: (
      <VStack spacing="1">
        <FAQText>
          Atomic Swap only ever submits one transaction to the blockchain. It
          will move the assets between your two wallets at the exact same time.
          You can verify this by looking up your transaction on{" "}
          <TextLink href="https://cardanoscan.io/" isExternal={true}>
            cardanoscan
          </TextLink>{" "}
          after you have made a successful swap. There is no way for anyone to
          get screwed since your funds will only be transferred if they also
          transfer their funds at the same time.
        </FAQText>
      </VStack>
    ),
    tags: ["Security"],
  },
  {
    question: "Is Atomic Swap using smart contracts?",
    answer: (
      <VStack spacing="1">
        <FAQText>
          No, Atomic Swap is not using smart contracts. Instead it is using
          multisig transactions that are faster (only one transaction instead of
          at least two), more secure (there can not be any bugs in the smart
          contract if there is no smart contract), and cheaper (because there is
          only one transaction and it is small).
        </FAQText>
      </VStack>
    ),
    tags: ["Smart Contracts"],
  },
  {
    question: "How is Atomic Swap funded?",
    answer: (
      <FAQText>
        On each swap made with Atomic Swap there is a commission of 2₳ (1₳ paid
        by each party of the transaction).
      </FAQText>
    ),
    tags: ["Funding", "Commission", "2₳"],
  },
  {
    question: "Who are behind Atomic Swap?",
    answer: (
      <FAQText>
        The team consists me, Frank Hampus Weslien. Checkout my{" "}
        <TextLink href="https://twitter.com/HampusFrank" isExternal={true}>
          twitter
        </TextLink>{" "}
        and personal{" "}
        <TextLink href="https://www.frankhampusweslien.com/" isExternal={true}>
          webpage
        </TextLink>
        .
      </FAQText>
    ),
    tags: ["Team", "Twitter", "Personal Webpage"],
  },
  {
    question: "Where can I download the Atomic Swap logo?",
    answer: (
      <FAQText>
        You find marketing material at this{" "}
        <TextLink
          href="https://drive.google.com/drive/folders/1-hdSmpXA9BaWwldOLd1leX_KUQJyqHRE?usp=sharing"
          isExternal={true}
        >
          link
        </TextLink>
        .
      </FAQText>
    ),
    tags: ["Community", "Advertisement", "Logo", "Marketing"],
  },

  {
    question: "Help, I signed a swap but it still hasn't gone through?!",
    answer: (
      <VStack spacing="1">
        <FAQText>
          The network is at times very congested and it can take some time
          before your swap hits the blockchain. If you just sit back it should
          eventually go through. However, if there has been more than 24h since
          you made the swap and it still isn&apos;t showing up in your wallet -
          it must have failed. Every swap has a TTL (Time To Live) of at most
          24h, after which whatever swap you made becomes invalid and can no
          longer be added to the blockchain.
        </FAQText>
      </VStack>
    ),
    tags: ["Time To Live", "Congestion"],
  },
  {
    question: "Is it safe to make other transactions after making a swap?",
    answer: (
      <VStack spacing="1">
        <FAQText>
          No, I would advice against it. On Cardano every transaction consumes
          UTxOs and output new UTxOs. Each UTxO can only be consumed once. If
          you have multiple transactions submitted to the blockchain and they
          contain any one of the same UTxOs, only the first transaction to be
          added to the blockchain will be valid. The other one will be invalid
          since the UTxO it consumes has already been consumed. Unfortunatly
          from a UX point of view there is no good way of making this clear to
          you as a user. Hopefully, Cardano will get this capability in the
          furture.
        </FAQText>
      </VStack>
    ),
    tags: ["Time To Live", "Congestion"],
  },
  {
    question: "Will Atomic Swap have a token?",
    answer: <FAQText>No, at this moment there are no such plans.</FAQText>,
    tags: ["Governance", "Token", "DAO"],
  },
  {
    question: "Will Atomic Swap have a DAO?",
    answer: <FAQText>No, at this moment there are no such plans.</FAQText>,
    tags: ["Token", "DAO"],
  },
  {
    question: "How is Atomic Swap governed?",
    answer: (
      <FAQText>
        I,{" "}
        <TextLink href="https://twitter.com/HampusFrank" isExternal={true}>
          Frank Hampus Weslien
        </TextLink>
        , shoot all the shoots for now.
      </FAQText>
    ),
    tags: ["Governance"],
  },
  {
    question: "Is Atomic Swap open source?",
    answer: <FAQText>No, not at this moment.</FAQText>,
    tags: ["open source"],
  },
];
