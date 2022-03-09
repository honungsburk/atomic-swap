import { Heading, VStack, Text, Spacer } from "@chakra-ui/react";
import React from "react";
import { Browser } from "../ChakraKawaii";
import CopyCard from "../CopyCard";
import colors from "../../Theme/colors";
import ErrorBoundary from "./ErrorBoundary";

export default class PageErrorBoundary extends ErrorBoundary {
  constructor(props: any) {
    super(props);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <Spacer></Spacer>
          <VStack spacing={8}>
            <Heading>The app crashed!</Heading>
            <VStack spacing={2}>
              <Browser size={200} mood="ko" color={colors.failure.default} />
              <VStack spacing={1}>
                <Text fontWeight={"bold"} maxW={300} textAlign={"center"}>
                  Please, report the error by copying the error below and post
                  it to the appopriate channel on discord.
                </Text>
                <Text fontSize={12} textAlign={"center"}>
                  (Discord link is at the bottom of the page)
                </Text>
              </VStack>
            </VStack>
            <CopyCard value={this.state.error}></CopyCard>
          </VStack>
        </>
      );
    }

    // eslint-disable-next-line react/prop-types
    return this.props.children;
  }
}
