import { ChannelPeerJS } from "./ChannelPeerJS";
import * as Session from "./Session";
import * as Audio from "./AudioChannel";
import * as Text from "./TextChannel";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";

class SessionHolder {
  static instance: Session.Session | null = null;
  static audioCall: Audio.AudioChannel | null = null;
  static textChannel: Text.TextChannel | null = null;

  static mkSession(lib: typeof CardanoSerializationLib): Session.Session {
    if (SessionHolder.instance === null) {
      const newChannel = new ChannelPeerJS<any>();
      const initSession = new Session.Session(newChannel, lib);
      SessionHolder.instance = initSession;
      return initSession;
    } else {
      return SessionHolder.instance;
    }
  }

  static mkAudioCall(): Audio.AudioChannel {
    if (SessionHolder.audioCall === null) {
      const audioCall = new Audio.AudioChannel();
      SessionHolder.audioCall = audioCall;
      return audioCall;
    } else {
      return SessionHolder.audioCall;
    }
  }

  static mkTextChannel(): Text.TextChannel {
    if (SessionHolder.textChannel === null) {
      const textChannel = new Text.TextChannel();
      SessionHolder.textChannel = textChannel;
      return textChannel;
    } else {
      return SessionHolder.textChannel;
    }
  }
}

export default SessionHolder;
