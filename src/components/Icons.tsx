import { Icon, IconProps } from "@chakra-ui/react";
import {
  AiFillLock,
  AiOutlineQuestionCircle,
  AiOutlineUnlock,
} from "react-icons/ai";
import { BiLinkExternal } from "react-icons/bi";
import { BsSoundwave, BsFileDiffFill, BsFillGearFill } from "react-icons/bs";
import { MdEdit, MdContentCopy } from "react-icons/md";
import { BsLink45Deg } from "react-icons/bs";
import {
  FaBook,
  FaDiscord,
  FaTwitter,
  FaGithub,
  FaYoutube,
  FaQuestion,
  FaMap,
  FaNewspaper,
  FaMicrophone,
  FaMicrophoneSlash,
  FaEnvelopeOpen,
  FaEnvelope,
  FaVolumeMute,
  FaVolumeDown,
  FaPhone,
  FaVolumeOff,
  FaVolumeUp,
  FaPhoneSlash,
  FaPlusCircle,
  FaMinusCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaCaretDown,
  FaCaretUp,
  FaMoon,
  FaSun,
  FaDownload,
  FaUpload,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaSkull,
} from "react-icons/fa";
import { HiSwitchHorizontal } from "react-icons/hi";
import { IoMdWallet } from "react-icons/io";
import { GoVerified } from "react-icons/go";

// Blacklist & WhiteList

export function Whitelist(props: IconProps) {
  return <Icon {...props} as={GoVerified} />;
}

export function Blacklist(props: IconProps) {
  return <Icon {...props} as={FaSkull} />;
}

// Navgation

export function ArrowRight(props: IconProps) {
  return <Icon {...props} as={FaArrowRight} />;
}

export function ArrowLeft(props: IconProps) {
  return <Icon {...props} as={FaArrowLeft} />;
}

// PWA Install/Uninstall

export function Install(props: IconProps) {
  return <Icon {...props} as={FaDownload} />;
}

export function Uninstall(props: IconProps) {
  return <Icon {...props} as={FaUpload} />;
}

// User Settings

export function Settings(props: IconProps) {
  return <Icon {...props} as={BsFillGearFill} />;
}

export function LightTheme(props: IconProps) {
  return <Icon {...props} as={FaSun} />;
}

export function DarkTheme(props: IconProps) {
  return <Icon {...props} as={FaMoon} />;
}

// State Symbol

export function Success(props: IconProps) {
  return <Icon {...props} as={FaCheckCircle} />;
}

export function Info(props: IconProps) {
  return <Icon {...props} as={FaInfoCircle} />;
}

export function Error(props: IconProps) {
  return <Icon {...props} as={FaExclamationCircle} />;
}

// Changelog

export function AdditionChangelog(props: IconProps) {
  return <Icon {...props} as={FaPlusCircle} />;
}

export function UpdateChangelog(props: IconProps) {
  return <Icon {...props} as={FaInfoCircle} />;
}

export function SubtractionChangelog(props: IconProps) {
  return <Icon {...props} as={FaMinusCircle} />;
}

// Chat

export function Telephone(props: IconProps) {
  return <Icon {...props} as={FaPhone} />;
}

export function TelephoneSlash(props: IconProps) {
  return <Icon {...props} as={FaPhoneSlash} />;
}

export function Mic(props: IconProps) {
  return <Icon {...props} as={FaMicrophone} />;
}

export function MicMute(props: IconProps) {
  return <Icon {...props} as={FaMicrophoneSlash} />;
}

export function MessagesClosed(props: IconProps) {
  return <Icon {...props} as={FaEnvelope} />;
}

export function MessagesOpen(props: IconProps) {
  return <Icon {...props} as={FaEnvelopeOpen} />;
}

export function VolumeHigh(props: IconProps) {
  return <Icon {...props} as={FaVolumeUp} />;
}

export function VolumeLow(props: IconProps) {
  return <Icon {...props} as={FaVolumeDown} />;
}

export function VolumeMute(props: IconProps) {
  return <Icon {...props} as={FaVolumeMute} />;
}

export function VolumeOff(props: IconProps) {
  return <Icon {...props} as={FaVolumeOff} />;
}

export function Sound(props: IconProps) {
  return <Icon {...props} as={BsSoundwave} />;
}

// Info

export function ChangeLog(props: IconProps) {
  return <Icon {...props} as={BsFileDiffFill} />;
}

export function INFO(props: IconProps) {
  return <Icon {...props} as={FaBook} />;
}

export function WhitePaper(props: IconProps) {
  return <Icon {...props} as={FaNewspaper} />;
}

export function FAQ(props: IconProps) {
  return <Icon {...props} as={FaQuestion} />;
}

export function Map(props: IconProps) {
  return <Icon {...props} as={FaMap} />;
}

// Social Media
export function Discord(props: IconProps) {
  return <Icon {...props} as={FaDiscord} />;
}

export function Youtube(props: IconProps) {
  return <Icon {...props} as={FaYoutube} />;
}

export function Twitter(props: IconProps) {
  return <Icon {...props} as={FaTwitter} />;
}

export function Github(props: IconProps) {
  return <Icon {...props} as={FaGithub} />;
}

// Wallet

export function Wallet(props: IconProps) {
  return <Icon {...props} as={IoMdWallet} />;
}

// Trading

export function Trade(props: IconProps) {
  return <Icon {...props} as={HiSwitchHorizontal} />;
}

export function ExternalIcon(props: IconProps) {
  return <Icon {...props} as={BiLinkExternal} />;
}

export function CaretDown(props: IconProps) {
  return <Icon {...props} as={FaCaretDown} />;
}

export function CaretUp(props: IconProps) {
  return <Icon {...props} as={FaCaretUp} />;
}

export function Edit(props: IconProps) {
  return <Icon {...props} as={MdEdit} />;
}

export function Lock(props: IconProps) {
  return <Icon {...props} as={AiFillLock} />;
}

export function Unlock(props: IconProps) {
  return <Icon {...props} as={AiOutlineUnlock} />;
}

export function Question(props: IconProps) {
  return <Icon {...props} as={AiOutlineQuestionCircle} />;
}

export function ContentCopy(props: IconProps) {
  return <Icon {...props} as={MdContentCopy} />;
}

export function Link(props: IconProps) {
  return <Icon {...props} as={BsLink45Deg} />;
}
