import {
  Box,
  Popover,
  PopoverTrigger,
  HStack,
  Text,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  VStack,
} from "@chakra-ui/react";
import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import { Question } from "../../components/Icons";
import TextLink from "../../components/TextLink";
import UnitDisplay from "../../components/UnitDisplay";

export default function CommissionInfo(props: { commission: BigNum }) {
  const fontSize = [10, null, 12, null, 14];
  const singleAmount = (
    <UnitDisplay
      as="span"
      fontSize={fontSize}
      quantity={props.commission}
      decimals={6}
      symbol={"₳"}
      hide={true}
    />
  );

  const doubleAmount = (
    <UnitDisplay
      as="span"
      fontSize={fontSize}
      quantity={props.commission.checked_mul(BigNum.from_str("2"))}
      decimals={6}
      symbol={"₳"}
      hide={true}
    />
  );

  return (
    <Popover>
      <PopoverTrigger>
        <HStack cursor="pointer" spacing={1}>
          <Question />
          <Text fontSize={fontSize} fontWeight={"light"}>
            Commission:{" "}
          </Text>
          <UnitDisplay
            fontSize={fontSize}
            fontWeight={"light"}
            quantity={props.commission}
            decimals={6}
            symbol={"₳"}
            hide={true}
          />
        </HStack>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontSize={fontSize}>Why Commission?</PopoverHeader>
        <PopoverBody fontSize={fontSize}>
          <VStack spacing={1}>
            <Box>
              <Text as="span">Each trading party pays a commission of</Text>{" "}
              {singleAmount} <Text as="span">for a total of </Text>
              {doubleAmount}
              <Text as="span">
                . The commission is necessary for the continues development and
                operation of Atomic Swap. Thank you!
              </Text>
            </Box>
            <Text>
              Follow us on{" "}
              <TextLink href="https://twitter.com/_atomicswap" isExternal>
                Twitter
              </TextLink>{" "}
              or/and join us on{" "}
              <TextLink href="https://discord.gg/ZqpN4TuJ6a" isExternal>
                Discord
              </TextLink>
              .{" "}
            </Text>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
