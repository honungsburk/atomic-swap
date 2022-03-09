import {
  Container,
  VStack,
  Heading,
  Flex,
  IconButton,
  Spacer,
  HStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import BetaTag from "../../components/BetaTag";
import Hidden from "../../components/Hidden";
import * as Icons from "../../components/Icons";

export function Layout(props: {
  header: string;
  hasBackButton?: boolean;
  isBeta?: boolean;
  children?: (string | JSX.Element)[] | string | JSX.Element;
}): JSX.Element {
  const navigate = useNavigate();
  return (
    <Container maxW="container.lg" mt={8}>
      <VStack spacing={8} width={"fill"} align="left">
        <Flex alignItems={"center"}>
          <Hidden isHidden={!props.hasBackButton}>
            <IconButton
              variant={"ghost"}
              aria-label="Navigate back"
              icon={<Icons.ArrowLeft boxSize={6} />}
              onClick={() => navigate("..")}
            />
          </Hidden>
          <Spacer />
          <HStack>
            <Heading fontSize={["xl", "2xl", "4xl"]} textAlign="center">
              {props.header}
            </Heading>
            <Hidden isHidden={!props.isBeta}>
              <BetaTag />
            </Hidden>
          </HStack>
          <Spacer />
        </Flex>
        {props.children ? props.children : <></>}
      </VStack>
    </Container>
  );
}
