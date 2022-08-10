import * as Peer from "peerjs";
import IDGenerator from "../Util/Behavior/IDGenerator";
import Observable from "../Util/Behavior/Observable";
import Queue from "../Util/Behavior/Queue";
import { ChannelState } from "./Channel";

type TextMessage = {
  kind: "TextMessage";
  text: string;
};

export function isTextMessage(x: any): x is TextMessage {
  return x.kind === "TextMessage";
}

export type Message = {
  id: string;
  who: "Me" | "Them";
  text: string;
};

export function isMessage(x: any): x is Message {
  return (
    (x.who === "Me" || x.who === "Them") &&
    typeof x.text === "string" &&
    typeof x.id === "string"
  );
}

/**
 */
export class TextChannel {
  private peer: Peer.Peer;
  private textConnection: Peer.DataConnection | null;
  private observable: Observable<Listener>;
  private queue: Queue<any>;
  private state: ChannelState;

  private id: string | null;
  private messages: Message[];
  private idGen: IDGenerator;

  constructor() {
    this.observable = new Observable();
    this.textConnection = null;
    this.id = null;
    this.state = "Initalized";
    this.queue = new Queue();
    this.messages = [];
    this.idGen = new IDGenerator();

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
    });

    this.peer.on("error", function (err) {
      channel.updateOnStateChange("Destroyed");
      channel.updateOnErrorChange(err);
    });

    // Set up listeners
    channel.peer.on("connection", function (c) {
      // Allow only a single connection
      channel.updateOnStateChange("Connected");

      if (channel.textConnection && channel.textConnection.open) {
        c.on("open", function () {
          // TODO: send a better error msg!
          c.send("Already connected to another client");
          setTimeout(function () {
            c.close();
          }, 500);
        });
        return;
      }
      channel.textConnection = c;
      channel.setUpTextConnection(c);
    });
  }

  /**
   * Triggered once a connection has been achieved.
   * Defines callbacks to handle incoming data and connection events.
   */
  private setUpTextConnection(conn: Peer.DataConnection): void {
    conn.on("error", (err: any) => {
      this.updateOnErrorChange(err);
    });

    conn.on("data", (data: any) => {
      if (isTextMessage(data)) {
        this.addTheirMessage(data.text);
        this.updateOnMessage();
      }
    });

    conn.on("close", () => {
      this.textConnection = null;
      this.updateOnStateChange("Waiting");
      this.queue.empty();
    });
    conn.on("open", () => {
      this.updateOnStateChange("Connected");
      this.flushMessages();
    });

    this.resetMessages();
  }

  ////////////////////////////////////////////////////////////////////////////////
  // MessageLog
  ////////////////////////////////////////////////////////////////////////////////

  private addTheirMessage(s: string): void {
    const msg: Message = {
      who: "Them",
      text: s,
      id: this.idGen.generate(),
    };
    this.messages.push(msg);
  }

  private addMyMessage(s: string): void {
    const msg: Message = {
      who: "Me",
      text: s,
      id: this.idGen.generate(),
    };
    this.messages.push(msg);
  }

  private updateOnMessage(): void {
    this.observable.forEachObserver((listener) => {
      if (listener.kind === "OnNewMessage") {
        const copy = this.messages.map((msg) => {
          return { ...msg };
        });
        listener.fn(copy);
      }
    });
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
  // Life Cycle
  //////////////////////////////////////////////////////////////////////////////

  isConnected(): boolean {
    return this.textConnection !== null && this.textConnection.open;
  }

  connect(id: string) {
    if (this.id) {
      this.textConnection = this.peer.connect(id);
      this.setUpTextConnection(this.textConnection);
    }
  }

  disconnect(): void {
    if (this.textConnection !== null) {
      this.textConnection.close();
      this.textConnection = null;
    }
    this.resetMessages();
  }

  destroy(): void {
    this.observable.deleteAllObservers();
    this.peer.destroy();
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
  // Messages
  //////////////////////////////////////////////////////////////////////////////

  getMessages(): Message[] {
    return this.messages.map((msg) => {
      return { ...msg };
    });
  }

  sendMessage(msg: string): void {
    this.addMyMessage(msg);
    this.updateOnMessage();
    const textMsg: TextMessage = {
      kind: "TextMessage",
      text: msg,
    };
    this.sendSafe(textMsg);
  }

  onMessage(fn: (messages: Message[]) => void): () => void {
    return this.observable.addObserver({
      kind: "OnNewMessage",
      fn: fn,
    });
  }

  private resetMessages(): void {
    this.messages = [];
    this.updateOnMessage();
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Sending Data
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Send a signal via the peer connection and add it to the log.
   * This will only occur if the connection is still alive.
   *
   * Warning: throws DisconnectedError if connection is closed
   */
  private send(data: any) {
    if (this.textConnection && this.textConnection.open) {
      this.textConnection.send(data);
    } else {
      throw new DisconnectedError("Connection is closed");
    }
  }

  private sendSafe(data: any) {
    this.queue.add(data);
    this.flushMessages();
  }

  private flushMessages() {
    if (this.textConnection && this.textConnection.open) {
      this.queue.flush((msg) => this.send(msg));
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Error
////////////////////////////////////////////////////////////////////////////////

export class DisconnectedError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DisconnectedError.prototype);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Listeners
////////////////////////////////////////////////////////////////////////////////

type Listener = ErrorChange | StateChange | GotID | OnNewMessage;

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

type OnNewMessage = {
  kind: "OnNewMessage";
  fn: (b: Message[]) => void;
};
