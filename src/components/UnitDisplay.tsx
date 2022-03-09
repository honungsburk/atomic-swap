import { Box, BoxProps } from "@chakra-ui/react";
import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import React from "react";
import { displayUnit, addCommasEveryN, removeTrailingZeros } from "../Util";

type UnitDisplayProps = {
  quantity: BigNum;
  decimals: number;
  symbol: JSX.Element | string;
  hide: boolean;
} & BoxProps;

const UnitDisplay = React.forwardRef<any, UnitDisplayProps>(
  ({ quantity, decimals, symbol, hide, ...rest }, ref) => {
    const total = quantity.to_str();
    const [num, subNum] = displayUnit(total, decimals);

    return (
      <Box ref={ref} {...rest}>
        {quantity ? (
          <>
            {addCommasEveryN(num, 3)}
            {(hide && removeTrailingZeros(subNum).length <= 0) || decimals === 0
              ? ""
              : "."}
            <span style={{ fontSize: "75%" }}>
              {hide ? removeTrailingZeros(subNum) : subNum}
            </span>{" "}
          </>
        ) : (
          "... "
        )}
        {symbol}
      </Box>
    );
  }
);

UnitDisplay.displayName = "UnitDisplay";

export default UnitDisplay;
