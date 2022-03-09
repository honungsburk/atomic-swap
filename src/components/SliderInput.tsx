import {
  NumberInputField,
  VStack,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberIncrementStepper,
  SliderTrack,
  SliderThumb,
  Slider,
  SliderFilledTrack,
  NumberInput,
  useColorModeValue,
} from "@chakra-ui/react";
import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import * as BigNumExtra from "../Cardano/BigNumExtra";
import * as Util from "../Util";
import * as React from "react";

function format(val: BigNum, decimals: number, lastString: string): string {
  const [num, subNum] = Util.displayUnit(val.to_str(), decimals);
  const lastVal = parseNum(lastString, decimals);
  if (lastVal.compare(val) === 0) {
    const split = lastString.split(".");
    let s = "";

    if (split.length >= 1 && split[0] !== "") {
      s = s + split[0];
    }

    if (split.length >= 2 && decimals > 0) {
      s = s + ".";
      if (split[1] !== "") {
        s = s + split[1].slice(0, decimals);
      }
    }

    return s;
  }
  const subNumS = Util.removeTrailingZeros(subNum);
  return subNumS === "" ? num : num + "." + subNumS;
}

function parseNum(str: string, decimals: number): BigNum {
  let val: BigNum = BigNum.zero();
  const split = str.split(".");

  if (split.length >= 1 && split[0] !== "") {
    const factor: BigNum = BigNum.from_str("1" + "0".repeat(decimals));
    const numBig = BigNum.from_str(split[0]).checked_mul(factor);
    val = val.checked_add(numBig);
  }

  if (split.length >= 2 && split[1] !== "" && decimals > 0) {
    const subNum = split[1];
    const subNumFixed = subNum.slice(0, decimals).padEnd(decimals, "0");

    const subNumBig: BigNum = BigNum.from_str(subNumFixed);
    val = val.checked_add(subNumBig);
  }

  return val;
}

export function SliderInput(props: {
  maxValue: BigNum;
  name: string;
  id: string;
  onBlur: () => void;
  onChange: () => void;
  setFieldValue: (n: BigNum) => void;
  value: BigNum;
  decimals?: number;
  symbol?: JSX.Element | string;
}) {
  const [lastString, setLastString] = React.useState("");
  const colorMode = useColorModeValue(
    {
      color: "black",
    },
    {
      color: "white",
    }
  );

  const decimals: number = props.decimals ? props.decimals : 0;
  const zero: BigNum = BigNum.zero();
  const maxValue: BigNum = props.maxValue;
  const value: BigNum = BigNumExtra.clamp(props.value, zero, maxValue);
  const calcPercent = () => {
    if (maxValue.is_zero() || value.is_zero()) {
      return 0;
    } else if (BigNumExtra.eq(value, maxValue)) {
      return 100;
    } else {
      return Math.round(
        (BigNumExtra.bigNumtoNumber(value) /
          BigNumExtra.bigNumtoNumber(maxValue)) *
          100
      );
    }
  };
  return (
    <VStack>
      <NumberInput
        color={colorMode.color}
        value={format(value, decimals, lastString)}
        isDisabled={maxValue.is_zero()}
        id={props.id}
        name={props.name}
        onBlur={props.onBlur}
        onChange={(s) => {
          try {
            const num = parseNum(s, decimals);
            setLastString(s);
            props.setFieldValue(BigNumExtra.clamp(num, zero, maxValue));
          } catch (err) {
            //
          }
        }}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Slider
        colorScheme={"primary"}
        flex="1"
        focusThumbOnChange={false}
        isDisabled={maxValue.is_zero()}
        value={calcPercent()}
        onBlur={props.onBlur}
        onChange={(pct: number) => {
          const n = pct * (BigNumExtra.bigNumtoNumber(maxValue) / 100);
          const round = isNaN(n) ? 0 : Math.round(n);
          const x = BigNum.from_str(round.toString());
          props.setFieldValue(BigNumExtra.clamp(x, zero, maxValue));
        }}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb fontSize="xs" boxSize="36px">
          {calcPercent()}
          {"%"}
        </SliderThumb>
      </Slider>
    </VStack>
  );
}
