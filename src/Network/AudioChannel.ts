import * as Peer from "peerjs";
import Observable from "../Util/Behavior/Observable";
import { ChannelState } from "./Channel";

export type CallState = IncomingCall | NoCall | InCall | Calling;

export type IncomingCall = {
  kind: "IncomingCall";
};

function incomingCall(): IncomingCall {
  return {
    kind: "IncomingCall",
  };
}

export function isIncomingCall(x: any): x is IncomingCall {
  return x.kind === "IncomingCall";
}

export type NoCall = {
  kind: "NoCall";
};

export function noCall(): NoCall {
  return {
    kind: "NoCall",
  };
}

export function isNoCall(x: any): x is NoCall {
  return x.kind === "NoCall";
}

export type InCall = {
  kind: "InCall";
  iHaveMic: boolean;
  theyHaveMic: boolean;
};

function inCall(iHaveMic: boolean, theyHaveMic: boolean): InCall {
  return {
    kind: "InCall",
    iHaveMic: iHaveMic,
    theyHaveMic: theyHaveMic,
  };
}

export function isInCall(x: any): x is InCall {
  return x.kind === "InCall";
}

export type Calling = {
  kind: "Calling";
};

function calling(): Calling {
  return {
    kind: "Calling",
  };
}

export function isCalling(x: any): x is Calling {
  return x.kind === "Calling";
}

/**
 */
export class AudioChannel {
  private peer: Peer.Peer;
  private inputAudioStream: MediaStream | undefined;
  private outputAudioStream: MediaStream | undefined;
  private audioCtx: AudioContext;
  private audioConnection: Peer.MediaConnection | null;
  private observable: Observable<Listener>;
  private gainNode: GainNode;
  private state: ChannelState;

  private callState: CallState;
  private checkCallState: NodeJS.Timeout | null;

  private id: string | null;

  // If mix is enabled or not
  private isMuted: boolean;

  constructor() {
    this.observable = new Observable();
    this.inputAudioStream = undefined;
    this.outputAudioStream = undefined;
    this.audioConnection = null;
    this.audioCtx = new AudioContext();
    this.gainNode = this.audioCtx.createGain();
    this.isMuted = false;
    this.id = null;
    this.state = "Initalized";
    this.callState = noCall();
    this.checkCallState = null;

    this.audioCtx.onstatechange = () => {
      this.updateOnAudioCTXState(this.audioCtx);
    };

    const peerOptions: Peer.PeerJSOption = {
      secure: true,
      // host:'peerjs-server.herokuapp.com',
      port: 443,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com",
          },
        ],
      } /* Sample servers, please use appropriate ones */,
    };

    this.peer = new Peer.Peer(peerOptions);

    this.peer.on("open", (id: string | null) => {
      if (id !== null) {
        this.id = id;
        this.observable.forEachObserver((ob) => {
          if (ob.kind === "GotID") {
            ob.fn(id);
          }
        });
        this.updateOnStateChange("Waiting");
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const channel = this;

    this.peer.on("disconnected", function () {
      channel.peer.reconnect();
      channel.updateOnStateChange("Reconnecting");
    });

    this.peer.on("close", function () {
      channel.updateOnStateChange("Destroyed");
      // this.updateOnCallState("NoCall"); ???
    });

    this.peer.on("error", function (err) {
      channel.updateOnStateChange("Destroyed");
      channel.updateOnErrorChange(err);
      // this.updateOnCallState("NoCall"); ???
    });

    // Set up listeners
    this.peer.on("call", async (audioConnection) => {
      this.audioConnection = audioConnection;
      this.updateOnCallState(incomingCall());
    });
  }

  async acceptCall(microphone: boolean) {
    this.audioCtx.resume();
    if (this.audioConnection) {
      try {
        let audioStream: MediaStream | undefined = undefined;
        if (microphone) {
          audioStream = await this.getMyAudioStream();
        }

        this.audioConnection.answer(audioStream);
        this.setUpAudioConnection(this.audioConnection);
      } catch (err) {
        this.updateOnErrorChange(err);
      }
    }
  }

  rejectCall() {
    this.updateOnCallState(noCall());
    if (this.audioConnection) {
      this.audioConnection.answer(undefined);
      this.audioConnection.close();
      this.audioConnection = null;
    }
  }

  async call(id: string) {
    const audioStream = await this.getMyAudioStream();
    if (audioStream !== undefined) {
      this.updateOnCallState(calling());
      // Make sure the audio context is on!
      // It can only be resumed if there has been user interaction (user has clicked a button)
      this.audioCtx.resume();
      // Can return undefined!
      this.audioConnection = this.peer.call(id, audioStream);
      this.setUpAudioConnection(this.audioConnection);
    } else {
      throw new NoMicError("Could not access the microphone.");
    }
  }

  private async getMyAudioStream(): Promise<MediaStream | undefined> {
    try {
      const audioOnly = { audio: true, video: false };
      const audioStream = await navigator.mediaDevices.getUserMedia(audioOnly);
      this.inputAudioStream = audioStream;
      // We must do this to guarrantee that we are in sync with
      // whatever code is muting/unmuting us.
      this.setMute(this.isMuted);
      return audioStream;
    } catch (err) {
      this.updateOnErrorChange(err);
      return undefined;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Stupid timer thing
  ////////////////////////////////////////////////////////////////////////////////

  private clearCheckIfInCall() {
    if (this.checkCallState !== null) {
      clearInterval(this.checkCallState);
      this.checkCallState = null;
    }
  }

  private checkIfInCall() {
    this.clearCheckIfInCall();
    let maxIterations = 0;
    const checkCallState = setInterval(() => {
      const gotAnser =
        this.audioConnection !== null && this.audioConnection.open;
      if (gotAnser) {
        this.updateOnCallState(
          inCall(
            this.inputAudioStream !== undefined,
            this.outputAudioStream !== undefined
          )
        );
        clearInterval(checkCallState);
      } else if (maxIterations > 20) {
        this.updateOnCallState(noCall());
        clearInterval(checkCallState);
      }
      maxIterations += 1;
    }, 500);

    const clear = setInterval(() => {
      clearInterval(checkCallState);
      clearInterval(clear);
    }, 20000);
    this.checkCallState = checkCallState;
  }

  private setUpAudioConnection(audioConnection: Peer.MediaConnection): void {
    // There is no event for when there is an audio connection so we have to
    // pull it ourselves.
    this.checkIfInCall();
    audioConnection.on("stream", (stream: any) => {
      this.clearCheckIfInCall();
      this.outputAudioStream = stream;
      this.updateOnCallState(
        inCall(
          this.inputAudioStream !== undefined,
          this.outputAudioStream !== undefined
        )
      );

      // There is a bug in the API - audio starts if you do this bs trick
      let a: HTMLAudioElement | null = new Audio();
      a.muted = true;
      a.srcObject = stream;
      a.addEventListener("canplaythrough", () => {
        a = null;
      });
      // end of trick

      // Create a MediaStreamAudioSourceNode
      // Feed the HTMLMediaElement into it
      const source = this.audioCtx.createMediaStreamSource(stream);

      // to control the volume
      // connect the AudioBufferSourceNode to the gainNode
      // and the gainNode to the destination, so we can play the
      // music and adjust the volume using the mouse cursor
      source.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
    });
    audioConnection.on("close", () => {
      this.updateOnCallState(noCall());
      this.clearCheckIfInCall();
      this.inputAudioStream = undefined;
      this.outputAudioStream = undefined;
      this.audioConnection = null;
      this.updateOnStateChange("Destroyed");
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Audio Controlls
  //////////////////////////////////////////////////////////////////////////////

  /**
   *
   * @param volume will multiply the signal with this amount (>1 is increase, 0 is mute)
   */
  setVolume(volume: number): void {
    this.gainNode.gain.value = volume;
  }

  /**
   *
   * @returns how much the audio is amplified
   */
  getVolume(): number {
    return this.gainNode.gain.value;
  }

  /**
   *
   * @param isMuted whether or not to mute the mic
   */
  setMute(isMuted: boolean): void {
    this.isMuted = isMuted;
    if (this.inputAudioStream) {
      this.inputAudioStream.getAudioTracks()[0].enabled = !this.isMuted;
    }
  }

  /**
   * Mute the mic
   */
  mute(): void {
    this.setMute(true);
  }

  /**
   * Unmute the mic
   */
  unmute(): void {
    this.setMute(false);
  }

  //////////////////////////////////////////////////////////////////////////////
  // ID
  //////////////////////////////////////////////////////////////////////////////

  getID(): string | null {
    return this.id;
  }

  onGotID(fn: (id: string) => void): () => void {
    return this.observable.addObserver({
      kind: "GotID",
      fn: fn,
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Is In Call
  //////////////////////////////////////////////////////////////////////////////

  getCallState(): CallState {
    return this.callState;
  }

  onCallState(fn: (state: CallState) => void): () => void {
    return this.observable.addObserver({
      kind: "CallState",
      fn: fn,
    });
  }

  private updateOnCallState(callState: CallState): void {
    this.callState = callState;
    this.observable.forEachObserver((listener) => {
      if (listener.kind === "CallState") {
        listener.fn(callState);
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Life Cycle
  //////////////////////////////////////////////////////////////////////////////

  disconnect(): void {
    if (this.audioConnection) {
      this.audioConnection.close();
      this.audioConnection = null;
    }
    this.updateOnCallState(noCall());
    this.inputAudioStream = undefined;
    this.outputAudioStream = undefined;
  }

  destroy(): void {
    this.updateOnCallState(noCall());
    this.observable.deleteAllObservers();
    this.peer.destroy();
    if (this.audioConnection) {
      this.audioConnection.close();
      this.audioConnection = null;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // State
  //////////////////////////////////////////////////////////////////////////////

  private updateOnStateChange(newState: ChannelState) {
    const oldState = this.state;
    this.state = newState;
    this.observable.forEachObserver((listener) => {
      if (listener.kind === "StateChange") {
        listener.fn(newState, oldState);
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Error
  //////////////////////////////////////////////////////////////////////////////

  onError(fn: (err: any) => void): () => void {
    return this.observable.addObserver({
      kind: "Error",
      fn: fn,
    });
  }

  private updateOnErrorChange(error: any) {
    this.observable.forEachObserver((listener) => {
      if (listener.kind === "Error") {
        listener.fn(error);
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // AudioCtxState
  //////////////////////////////////////////////////////////////////////////////

  enableAudio(): Promise<void> {
    return this.audioCtx.resume();
  }

  getAudioCtxState(): AudioContextState {
    return this.audioCtx.state;
  }

  onAudioCtxState(fn: (ctx: AudioContextState) => void): () => void {
    return this.observable.addObserver({
      kind: "AudioCTXState",
      fn: fn,
    });
  }

  private updateOnAudioCTXState(audioCtx: AudioContext) {
    this.observable.forEachObserver((listener) => {
      if (listener.kind === "AudioCTXState") {
        listener.fn(audioCtx.state);
      }
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// Listeners
////////////////////////////////////////////////////////////////////////////////

type Listener = ErrorChange | StateChange | GotID | OnCallState | AudioCTXState;

type ErrorChange = {
  kind: "Error";
  fn: (error: any) => void;
};

type StateChange = {
  kind: "StateChange";
  fn: (current: ChannelState, previous: ChannelState) => void;
};

type GotID = {
  kind: "GotID";
  fn: (id: string) => void;
};

type OnCallState = {
  kind: "CallState";
  fn: (b: CallState) => void;
};

type AudioCTXState = {
  kind: "AudioCTXState";
  fn: (ctx: AudioContextState) => void;
};

////////////////////////////////////////////////////////////////////////////////
// Errors
////////////////////////////////////////////////////////////////////////////////

export class NoMicError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NoMicError.prototype);
  }
}

export class NoAudioError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NoAudioError.prototype);
  }
}
