import colors from "../Theme/colors";
import AtomicSwapLogoDark from "../assets/img/atomic-swap-logo-dark-192.png";
import AtomicSwapLogoLight from "../assets/img/atomic-swap-logo-light-192.png";
import QRCodeStyling from "qr-code-styling";
import React, { useEffect } from "react";
import { useColorModeValue } from "@chakra-ui/react";

const qrCode = new QRCodeStyling({
  image: AtomicSwapLogoDark,
  backgroundOptions: {
    color: colors.background.light,
  },
  dotsOptions: {
    color: colors.black,
    type: "dots",
  },
  cornersSquareOptions: {
    type: "extra-rounded",
    color: colors.secondary.default,
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 8,
  },
});

export default function QRCode(props: {
  value: string;
  width?: number;
  height?: number;
}) {
  const logoSrc = useColorModeValue(AtomicSwapLogoDark, AtomicSwapLogoLight);
  const backgroundColor = useColorModeValue(
    colors.background.light,
    colors.background.dark
  );
  const dotsColor = useColorModeValue(colors.black, colors.white);
  const ref = React.useRef(null);

  useEffect(
    () => qrCode.append(ref.current === null ? undefined : ref.current),
    []
  );

  React.useEffect(() => {
    qrCode.update({
      image: logoSrc,
      width: props.width,
      height: props.height,
      data: props.value,
      backgroundOptions: {
        color: backgroundColor,
      },
      dotsOptions: {
        color: dotsColor,
        type: "dots",
      },
    });
  }, [
    props.value,
    props.width,
    props.height,
    logoSrc,
    backgroundColor,
    dotsColor,
  ]);

  return <div ref={ref} />;
}
