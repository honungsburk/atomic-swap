import {
  HStack,
  VStack,
  Spacer,
  Flex,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import VoiceChat from "./VoiceChat";
import * as TextChat from "./TextChat";
import React from "react";
import * as Text from "../Network/TextChannel";
import SessionHolder from "../Network/SessionHolder";
import { VariableSizeList } from "react-window";
import * as Store from "src/Store";

export default function ChatBar(props: { size: "sm" | "md" }) {
  const session = Store.Session.use((s) => s.session);
  const [textMessage, setTextMessage] = React.useState("");
  const [chatIsOpen, setChatIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Text.Message[]>([]);
  const [seenMessages, setSeenMessages] = React.useState<number>(0);
  const [unseenMessages, setUnseenMessages] = React.useState<number>(0);
  const [textChannel, setTextChannel] = React.useState<
    Text.TextChannel | undefined
  >(undefined);

  const openChat = () => {
    setChatIsOpen(true);
  };

  const closeChat = () => {
    setChatIsOpen(false);
  };

  const dynamicListRef = React.useRef<VariableSizeList<any>>();
  React.useEffect(() => {
    if (chatIsOpen) {
      setSeenMessages(messages.length);
      setUnseenMessages(0);
    } else {
      setUnseenMessages(messages.length - seenMessages);
    }
    if (dynamicListRef.current) {
      dynamicListRef.current.scrollToItem(messages.length, "start");
    }
  }, [messages, chatIsOpen]);

  React.useEffect(() => {
    const newTextChannel = SessionHolder.mkTextChannel();
    setMessages(newTextChannel.getMessages());
    const clean1 = newTextChannel.onMessage(setMessages);
    const clean2 = newTextChannel.onGotID((id) => session.sendMyTextChatID(id));
    const clean3 = session.onTheirTextChatID((id) => {
      if (!newTextChannel.isConnected()) {
        newTextChannel.connect(id);
      }
    });

    const id = newTextChannel.getID();
    if (id !== null) {
      session.sendMyTextChatID(id);
    }
    setTextChannel(newTextChannel);

    return () => {
      clean1();
      clean2();
      clean3();
      newTextChannel.disconnect();
    };
  }, [session]);

  // This weird inversion is done so that when we remove the voice chat buttons
  // when the user is writting a message we do NOT remove the on call dialog
  const [voiceChatButtons, answer] = VoiceChat({ session: session });

  let width = 300;
  let px = 4;

  if (props.size === "sm") {
    px = 1;
    width = 260;
  }

  const colorMode = useColorModeValue(
    {
      bgColor: "accent.500",
      boxShadow: "0px 0px 12px #888",
    },
    {
      bgColor: "accentDarkMode.700",
      boxShadow: "0px 0px 12px #000",
    }
  );

  const chatBar = (
    <Flex
      bgColor={colorMode.bgColor}
      boxShadow={colorMode.boxShadow}
      rounded={40}
      py={2}
      px={px}
      width={width}
    >
      <HStack align="end">
        {textMessage.length === 0 ? voiceChatButtons : <></>}
        <TextChat.TextChatInput
          value={textMessage}
          onChange={setTextMessage}
          onKeyEnter={(s) => {
            if (textChannel) {
              textChannel.sendMessage(s);
              setTextMessage("");
              openChat();
            }
          }}
        />
      </HStack>
      <Spacer />
      <Box width="8px" height="8px"></Box>
      <TextChat.TextChatButton
        unseenMessages={unseenMessages}
        isOpen={chatIsOpen}
        onClose={() => closeChat()}
        onOpen={() => openChat()}
      />
    </Flex>
  );

  return (
    <VStack width={width}>
      <TextChat.TextChatHistory
        customRef={dynamicListRef}
        onClose={() => closeChat()}
        show={chatIsOpen}
        height={300}
        messages={messages}
      ></TextChat.TextChatHistory>
      {chatBar}
      {answer}
    </VStack>
  );
}
