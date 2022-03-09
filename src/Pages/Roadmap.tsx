import {
  Container,
  Heading,
  VStack,
  Text,
  Box,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import TextLink from "../components/TextLink";
import RoadMapIllustrationLight from "../assets/img/illustrations/Roadmap.jpg";
import RoadMapIllustrationDark from "../assets/img/illustrations/Roadmap-dark.jpg";

export default function Roadmap() {
  const roadmapIllustrationLight = useColorModeValue(
    RoadMapIllustrationLight,
    RoadMapIllustrationDark
  );

  return (
    <Container maxW="container.lg" my={8}>
      <VStack spacing={2}>
        <VStack spacing={1}>
          <Heading textAlign="center" fontSize={["4xl", null, "5xl"]}>
            Roadmap - Spring 2022
          </Heading>
          <Text>(In no particular order)</Text>
        </VStack>
        <Image
          width={["sm", null, "md"]}
          src={roadmapIllustrationLight}
          alt="Illustartion of a roadmap"
        ></Image>
        <VStack spacing={12}>
          <Task header="Open Source">
            <Text>
              Atomc Swap will be open sourced in the coming months. It is not
              considered an urgent feature (though a nice one!).
            </Text>
          </Task>
          <Task header="P2P Text & Voice Chat">
            <Text>P2p text and voice chat will arrive in March.</Text>
          </Task>
          <Task header="Native Asset Verification">
            <Text>
              The need for verification is clear but how it will be impemented
              is still being discussed. You can read some thoughts on the matter
              at this{" "}
              <TextLink
                isExternal={true}
                href="https://forum.cardano.org/t/cip-decentralized-native-asset-verification/94827"
              >
                link
              </TextLink>
              .{" "}
            </Text>
          </Task>

          <Task header="... And More!">
            <Text>
              There are of course a bunch more ideas but the details of those
              have not been ironed out. Follow us on{" "}
              <TextLink
                isExternal={true}
                href="https://twitter.com/_atomicswap"
              >
                twitter
              </TextLink>{" "}
              to get the latest updates!
            </Text>
          </Task>
        </VStack>
      </VStack>
    </Container>
  );
}

function Task(props: { header: string; children: React.ReactElement }) {
  return (
    <VStack spacing={2}>
      <Heading textAlign="center" fontSize={["3xl", null, "4xl"]}>
        {props.header}
      </Heading>
      <Box maxWidth={"md"} textAlign="center">
        {props.children}
      </Box>
    </VStack>
  );
}
