import {
  HStack,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Button,
  Box,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  VStack,
  Text,
} from "@chakra-ui/react";
import {
  Mic,
  VolumeHigh,
  VolumeLow,
  MicMute,
  VolumeMute,
  Sound,
  Telephone,
  TelephoneSlash,
} from "./Icons";
import * as Audio from "../Network/AudioChannel";
import React from "react";
import SessionHolder from "../Network/SessionHolder";
import { Session } from "../Network/Session";
import * as MathUtil from "../Util/Math";
import Store from "../Storage/Store";
import ToolTip from "./ToolTip";

export default function VoiceChat(props: {
  session: Session;
}): [JSX.Element, JSX.Element] {
  const toast = useToast();
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [theirAudioID, setTheirAudioID] = React.useState<string | null>(null);
  const [audioChannel, setAudioChannel] = React.useState<
    Audio.AudioChannel | undefined
  >(undefined);

  const [volume, setVolume] = React.useState<number>(50);
  const [audioCtxState, setAudioCtxState] =
    React.useState<AudioContextState>("running");

  const [callState, setCallState] = React.useState<Audio.CallState>(
    Audio.noCall()
  );

  // incomming Call
  React.useEffect(() => {
    if (audioChannel !== undefined) {
      setCallState(audioChannel.getCallState());
      return audioChannel.onCallState(setCallState);
    }
  }, [audioChannel]);

  // audioCtxState
  React.useEffect(() => {
    if (audioChannel !== undefined) {
      setAudioCtxState(audioChannel.getAudioCtxState());
      return audioChannel.onAudioCtxState((ctx) => {
        setAudioCtxState(ctx);
      });
    }
  }, [audioChannel]);

  // Volume
  React.useEffect(() => {
    const store = Store.create();
    const v = store.getVolume();
    if (v !== undefined) {
      setVolume(MathUtil.clamp(v.volume, 0, 100));
    }
  }, []);

  React.useEffect(() => {
    if (audioChannel) {
      // We increase volume like this as it feels more intuitive.
      const gain = 2 ** (volume / 100) - 1;
      audioChannel.setVolume(gain);
      // Save
      const store = Store.create();
      store.setVolume(volume);
    }
  }, [audioChannel, volume]);

  // Muted
  React.useEffect(() => {
    if (audioChannel) {
      audioChannel.setMute(isMuted);
    }
  }, [audioChannel, isMuted]);

  // Errors
  React.useEffect(() => {
    if (audioChannel !== undefined) {
      return audioChannel.onError((err) => {
        toast({
          title: "Audio Chat experienced an error",
          description: "" + err,
          status: "error",
          duration: 20000,
          isClosable: true,
        });
      });
    }
  }, [audioChannel, toast]);

  // Audio
  React.useEffect(() => {
    const newAudioCall = SessionHolder.mkAudioCall();
    // Send our ID to the other person so that they can call us!
    newAudioCall.onGotID((id) => {
      props.session.sendMyVoiceChatID(id);
    });
    const id = newAudioCall.getID();
    if (id !== null) {
      props.session.sendMyVoiceChatID(id);
    }

    setAudioChannel(newAudioCall);
    return () => {
      newAudioCall.disconnect();
    };
  }, [props.session]);

  React.useEffect(() => {
    setTheirAudioID(props.session.getTheirVoiceChatID());
    return props.session.onTheirVoiceChatID((id) => {
      setTheirAudioID(id);
    });
  }, [props.session]);

  //////////////////////////////////////////////////////////////////////////////
  // GUI
  //////////////////////////////////////////////////////////////////////////////

  let callButtonClick: (() => void) | undefined = undefined;

  if (audioChannel && theirAudioID !== null) {
    callButtonClick = () => {
      try {
        audioChannel.call(theirAudioID);
      } catch (err) {
        toast({
          title: "Failed To Call",
          description: "" + err,
          status: "info",
          duration: 9000,
          isClosable: true,
        });
      }
    };
  }

  let buttons = (
    <CallButton
      call={callButtonClick}
      isCalling={Audio.isIncomingCall(callState) || Audio.isCalling(callState)}
    ></CallButton>
  );
  if (Audio.isInCall(callState) && audioChannel) {
    let volumeButton = (
      <EnableAudioButton onClick={() => audioChannel.enableAudio()} />
    );
    if (audioCtxState === "running") {
      if (callState.theyHaveMic) {
        volumeButton = (
          <VolumeButton
            volume={volume}
            onVolumeChange={(n) => {
              const v = MathUtil.clamp(n, 0, 100);
              setVolume(v);
            }}
          />
        );
      } else {
        volumeButton = <TheyHaveNoMic />;
      }
    }

    let micButton = <IDoNotHaveMic />;
    if (callState.iHaveMic) {
      micButton = (
        <MicButton
          isMuted={isMuted}
          onMute={() => setIsMuted(true)}
          onUnmute={() => setIsMuted(false)}
        />
      );
    }

    buttons = (
      <HStack>
        {volumeButton}
        {micButton}
      </HStack>
    );
  }

  return [
    buttons,
    audioChannel ? (
      <IncomingCall
        isOpen={Audio.isIncomingCall(callState)}
        acceptMicAndAudio={() => {
          audioChannel.acceptCall(true);
        }}
        acceptAudio={() => {
          audioChannel.acceptCall(false);
        }}
        reject={() => {
          audioChannel.rejectCall();
        }}
      />
    ) : (
      <></>
    ),
  ];
}

function EnableAudioButton(props: { onClick: () => void }) {
  return (
    <Button
      leftIcon={<VolumeLow />}
      onClick={props.onClick}
      colorScheme="primary"
      variant={"ghost"}
    >
      Enable
    </Button>
  );
}

function CallButton(props: { call?: () => void; isCalling: boolean }) {
  return (
    <Button
      isLoading={props.isCalling}
      loadingText="Call"
      leftIcon={<Telephone />}
      onClick={props.call}
      variant={"ghost"}
    >
      Call
    </Button>
  );
}

function MicButton(props: {
  isMuted: boolean;
  onMute: () => void;
  onUnmute: () => void;
}) {
  if (props.isMuted) {
    return (
      <IconButton
        variant={"ghost"}
        aria-label="Unmute"
        icon={<MicMute />}
        onClick={props.onUnmute}
      />
    );
  } else {
    return (
      <IconButton
        variant={"ghost"}
        aria-label="Mute"
        icon={<Mic />}
        onClick={props.onMute}
      />
    );
  }
}

function IDoNotHaveMic() {
  return (
    <ToolTip label="You have no mic">
      <IconButton
        variant={"ghost"}
        aria-label="Mute"
        colorScheme={"secondary"}
        icon={<MicMute />}
      />
    </ToolTip>
  );
}

function TheyHaveNoMic() {
  return (
    <ToolTip label="They have no mic">
      <IconButton
        variant={"ghost"}
        aria-label="Mute"
        colorScheme={"secondary"}
        icon={<VolumeMute />}
      />
    </ToolTip>
  );
}

function VolumeButton(props: {
  volume: number;
  onVolumeChange: (n: number) => void;
}) {
  let icon = <VolumeMute />;

  if (props.volume > 50) {
    icon = <VolumeHigh />;
  } else if (props.volume > 0) {
    icon = <VolumeLow />;
  }

  // The outer box protexts us from accidentally adding margin to the popover which
  // generates bunch of error messages
  return (
    <Box>
      <Popover>
        <PopoverTrigger>
          <IconButton variant={"ghost"} aria-label="Unmute" icon={icon} />
        </PopoverTrigger>
        <PopoverContent width={10} py={4}>
          <PopoverArrow />
          <Slider
            value={props.volume}
            onChange={(v) => props.onVolumeChange(v)}
            aria-label="Volume Slider"
            orientation="vertical"
            minH="32"
            min={0}
            max={100}
            colorScheme="primary"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6}>
              <Sound fontSize={16}></Sound>
            </SliderThumb>
          </Slider>
        </PopoverContent>
      </Popover>
    </Box>
  );
}

function IncomingCall(props: {
  isOpen: boolean;
  acceptMicAndAudio: () => void;
  acceptAudio: () => void;
  reject: () => void;
}) {
  const rejectRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <AlertDialog
      isOpen={props.isOpen}
      leastDestructiveRef={rejectRef}
      onClose={props.reject}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Incoming Call
          </AlertDialogHeader>

          <AlertDialogBody>
            <VStack>
              <AnsButton
                icon={<Telephone />}
                text={"Mic & Audio"}
                ariaLabel={"Accept call and joing with microphone and audio"}
                bgColor="success.500"
                hoverBgColor="success.600"
                color="white"
                onClick={props.acceptMicAndAudio}
              />
              <AnsButton
                icon={<VolumeLow />}
                text={"Audio Only"}
                ariaLabel={"Accept call and joing with only audio"}
                bgColor="secondary.500"
                hoverBgColor="secondary.600"
                color="white"
                onClick={props.acceptAudio}
              />

              <AnsButton
                icon={<TelephoneSlash />}
                text={"Reject"}
                ariaLabel={"Reject call"}
                bgColor="failure.500"
                hoverBgColor="failure.600"
                color="white"
                onClick={props.reject}
              />
            </VStack>
          </AlertDialogBody>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

function AnsButton(props: {
  icon: JSX.Element;
  text: string;
  onClick: () => void;
  bgColor: string;
  ariaLabel: string;
  hoverBgColor: string;
  color: string;
}) {
  return (
    <HStack
      px={8}
      width={"200px"}
      height={"60px"}
      aria-label={props.ariaLabel}
      bgColor={props.bgColor}
      _hover={{ bg: props.hoverBgColor }}
      color={props.color}
      onClick={props.onClick}
      rounded={8}
      cursor={"pointer"}
    >
      {props.icon}
      <Text fontSize={18} fontWeight="bold">
        {props.text}
      </Text>
    </HStack>
  );
}
