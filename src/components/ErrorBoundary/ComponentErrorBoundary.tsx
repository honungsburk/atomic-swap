import React from "react";
import { HStack } from "@chakra-ui/react";
import ErrorBoundary from "./ErrorBoundary";

export default class ComponentErrorBoundary extends ErrorBoundary {
  constructor(props: any) {
    super(props);
  }
  render(): React.ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <HStack bgColor={"white"} rounded={40} py={2} px={4}></HStack>;
    }

    // eslint-disable-next-line react/prop-types
    return this.props.children;
  }
}
