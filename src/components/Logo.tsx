import { Image, useColorModeValue } from "@chakra-ui/react";
import AtomicSwapLogoDark from "../assets/img/atomic-swap-logo-dark-192.png";
import AtomicSwapLogoLight from "../assets/img/atomic-swap-logo-light-192.png";

/**
 * Is darkmode compatible
 *
 *
 * @param props the sixe of the logo
 * @returns The Atomic Swap logo
 */
export default function AtomicSwapLogo(props: {
  boxSize: string;
}): JSX.Element {
  const src = useColorModeValue(AtomicSwapLogoDark, AtomicSwapLogoLight);
  return (
    <Image
      boxSize={props.boxSize}
      objectFit="cover"
      src={src}
      alt="Atomic Swap Logo"
    ></Image>
  );
}
