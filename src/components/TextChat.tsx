import {
  IconButton,
  Textarea,
  Text,
  Box,
  VStack,
  CloseButton,
  Flex,
  Spacer,
  useConst,
  Center,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { MessagesOpen, MessagesClosed } from "./Icons";
import DynamicList, { createCache } from "react-window-dynamic-list";
import AutoSizer from "react-virtualized-auto-sizer";
import * as TextChannel from "../Network/TextChannel";
import colors from "../Theme/colors";
import { Ghost } from "./ChakraKawaii";
import { VariableSizeList } from "react-window";

/**
 *
 * @param s the string to check the number of lines in
 * @param maxWidth the max width for a line in pixels
 * @param font the font that is being used
 * @returns the number of lines
 */
export function nbrLinesToShow(
  s: string,
  maxWidth: number,
  textMeasure: (s: string) => number
): number {
  let lines = 1;
  let rest = s;
  let charactersToTake = 1;

  while (rest.length > 0) {
    const slice = rest.slice(0, charactersToTake);
    const hasNewline = /\r|\n/.exec(slice);
    const textWidth = textMeasure(slice);

    if (hasNewline) {
      rest = rest.slice(charactersToTake);
      charactersToTake = 1;
      lines += 1;
    } else if (textWidth >= maxWidth) {
      rest = rest.slice(charactersToTake - 1);
      charactersToTake = 1;
      lines += 1;
    } else if (charactersToTake > rest.length) {
      return lines;
    } else {
      charactersToTake += 1;
    }
  }

  return lines;
}

// TODO: check for newlines
export function TextChatInput(props: {
  value: string;
  onChange: (s: string) => void;
  onKeyEnter: (s: string) => void;
}) {
  const colorMode = useColorModeValue(
    {
      borderColor: "accent.900",
      borderColorHover: "black",
      placeholderColor: "accent.900",
    },
    {
      borderColor: "accentDarkMode.300",
      borderColorHover: "white",
      placeholderColor: "accentDarkMode.300",
    }
  );

  const textAreaEl = React.useRef<null | HTMLTextAreaElement>(null);
  let lines = 1;

  // Calculate the width of the text to determine appropriate height
  if (textAreaEl.current) {
    const font = TextMeasure.getCanvasFontSize(textAreaEl.current);
    lines = nbrLinesToShow(props.value, 170, (s) =>
      TextMeasure.getTextWidth(s, font)
    );
  }
  const height = 20 + 20 * Math.min(4, lines);

  return (
    <Textarea
      rounded={20}
      ref={textAreaEl}
      borderColor={colorMode.borderColor}
      focusBorderColor="primary.500"
      _placeholder={{ color: colorMode.placeholderColor }}
      _hover={{ borderColor: colorMode.borderColor }}
      maxHeight={height + "px"}
      minHeight={10}
      height={height + "px"}
      placeholder="Aa"
      resize={"none"}
      onChange={(e) => {
        const inputValue = e.target.value;
        const noNewlines = inputValue.replace(/(\r\n|\n|\r)/gm, "");
        props.onChange(noNewlines);
      }}
      onKeyPress={(e) => {
        if (e.key === "Enter" && props.value.length > 0) {
          props.onKeyEnter(props.value);
        }
      }}
      value={props.value}
    ></Textarea>
  );
}

export function TextChatButton(props: {
  unseenMessages: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const hidden = props.unseenMessages === 0;
  const badgeText =
    props.unseenMessages > 99 ? "+99" : props.unseenMessages.toString();

  if (props.isOpen) {
    return (
      <Badge text={badgeText} hidden={hidden}>
        <IconButton
          variant={"ghost"}
          aria-label="Close the chat history"
          icon={<MessagesOpen />}
          onClick={props.onClose}
        />
      </Badge>
    );
  } else {
    return (
      <Badge text={badgeText} hidden={hidden}>
        <IconButton
          variant={"ghost"}
          aria-label="Open the chat history"
          icon={<MessagesClosed />}
          onClick={props.onOpen}
        />
      </Badge>
    );
  }
}

function Badge(props: {
  hidden?: boolean;
  text: string;
  children: (string | JSX.Element) | (string | JSX.Element)[];
}) {
  return (
    <Box>
      {props.children}
      {!props.hidden || props.hidden === undefined ? (
        <Center
          pointerEvents="none"
          rounded={80}
          position="absolute"
          zIndex={2}
          bgColor="red"
          boxSize={"1rem"}
          bottom="12px"
          right={"16px"}
        >
          <Text fontSize={12} color="white">
            {props.text}
          </Text>
        </Center>
      ) : (
        <></>
      )}
    </Box>
  );
}

// must contain a unique id field to work properly with DynamicList
// https://www.npmjs.com/package/react-window-dynamic-list#warning-requirements-and-limitations-warning

type TextChatHistoryProps = {
  show: boolean;
  messages: TextChannel.Message[];
  height: number;
  onClose: () => void;
  customRef?: React.MutableRefObject<VariableSizeList<any> | undefined>;
};

/**
 *
 * NOTE: since we are using DynamicList all the message styling must be inline. Otherwise it can not compute the correct heights.
 *
 * @param props
 * @returns
 */
export function TextChatHistory(props: TextChatHistoryProps) {
  const cache = useConst(createCache()); //TODO: might be dangerous...
  const colorMode = useColorModeValue(
    {
      bgColor: "accent.500",
      boxShadow: "0px 0px 12px #888",
      internalShadow: "inset 0px 11px 8px -10px #888",
    },
    {
      bgColor: "accentDarkMode.700",
      boxShadow: "0px 0px 12px #000",
      internalShadow: "inset 0px 11px 8px -10px #000",
    }
  );
  return (
    <Flex
      visibility={props.show ? "visible" : "hidden"}
      bgColor={colorMode.bgColor}
      rounded={16}
      height={props.height}
      pb={2}
      alignItems="start"
      width={"100%"}
      direction={"column"}
      boxShadow={colorMode.boxShadow}
    >
      <Flex width={"100%"} py={1} px={1}>
        <Spacer />
        <CloseButton size={"sm"} onClick={props.onClose} />
      </Flex>
      <Box height={"100%"} width={"100%"} boxShadow={colorMode.internalShadow}>
        {props.messages.length === 0 ? (
          <VStack>
            <Ghost mt={8} size={120} mood="sad" color={colors.white}></Ghost>
            <Text fontSize={12}>There are no messages</Text>
          </VStack>
        ) : (
          <AutoSizer>
            {({ width, height }: any) => {
              return (
                <DynamicList
                  ref={props.customRef}
                  cache={cache}
                  data={props.messages}
                  width={width - 4}
                  height={height}
                  measurementContainerElement={({ style, children }) => {
                    return (
                      <Box style={style} width={width}>
                        {children}
                      </Box>
                    );
                  }}
                >
                  {({ index, style }: any) => {
                    const message = props.messages[index];
                    const color =
                      message.who === "Me" ? colors.white : colors.black;
                    const bgColor =
                      message.who === "Me"
                        ? colors.primary[500]
                        : colors.accent[700];
                    const justifyContent =
                      message.who === "Me" ? "flex-end" : "flex-start";
                    return (
                      <div style={style}>
                        <div
                          style={{
                            display: "flex",
                            width: "100%",
                            flexDirection: "row",
                            justifyContent: justifyContent,
                          }}
                        >
                          <div
                            style={{
                              display: "inline-block",
                              borderRadius: "8px",
                              color: color,
                              background: bgColor,
                              margin: "8px 8px 0px 8px",
                              padding: "2px 8px",
                              maxWidth: width * 0.8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 14,
                                whiteSpace: "inherit",
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              {message.text}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </DynamicList>
              );
            }}
          </AutoSizer>
        )}
      </Box>
    </Flex>
  );
}

TextChatHistory.displayName = "TextChatHistory";

////////////////////////////////////////////////////////////////////////////////
// Calculate text width
////////////////////////////////////////////////////////////////////////////////

class TextMeasure {
  private static canvas: null | HTMLCanvasElement = null;

  /**
   * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
   *
   * @param {String} text The text to be rendered.
   * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
   *
   * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
   */
  static getTextWidth(text: string, font: string): number {
    // re-use canvas object for better performance
    if (TextMeasure.canvas === null) {
      TextMeasure.canvas = document.createElement("canvas");
    }

    const context = TextMeasure.canvas.getContext("2d");
    if (context !== null) {
      context.font = font;
      const metrics = context.measureText(text);
      return metrics.width;
    }
    throw new Error("Could not get 2d canvas context!");
  }

  private static getCssStyle(element: Element, prop: string): string {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
  }

  static getCanvasFontSize(el: Element) {
    const fontWeight = TextMeasure.getCssStyle(el, "font-weight") || "normal";
    const fontSize = TextMeasure.getCssStyle(el, "font-size") || "16px";
    const fontFamily =
      TextMeasure.getCssStyle(el, "font-family") || "Times New Roman";

    return `${fontWeight} ${fontSize} ${fontFamily}`;
  }
}
