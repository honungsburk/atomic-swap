import { chakra } from "@chakra-ui/react";
import * as Kawaii from "react-kawaii";

export const Planet = chakra(Kawaii.Planet, {
  shouldForwardProp: (prop) => ["color", "mood", "size"].includes(prop),
});
export const Ghost = chakra(Kawaii.Ghost, {
  shouldForwardProp: (prop) => ["color", "mood", "size"].includes(prop),
});
export const Browser = chakra(Kawaii.Browser, {
  shouldForwardProp: (prop) => ["color", "mood", "size"].includes(prop),
});
export const CreditCard = chakra(Kawaii.CreditCard, {
  shouldForwardProp: (prop) => ["color", "mood", "size"].includes(prop),
});
