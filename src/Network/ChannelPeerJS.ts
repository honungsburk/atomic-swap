import * as Peer from "peerjs";
import Observable from "../Util/Behavior/Observable";
import Queue from "../Util/Behavior/Queue";
import { Channel, ChannelState } from "./Channel";
export type ListenerKind = "StateChange" | "Receive";

type Listener<T> = StateChangeListener | ReceiveListener<T> | ErrorListener;

type StateChangeListener = {
  kind: "StateChange";
  fn: (state: ChannelState, previous: ChannelState) => void;
};

type ReceiveListener<T> = {
  kind: "Receive";
  fn: (data: T) => void;
};

type ErrorListener = {
  kind: "Error";
  fn: (err: any) => void;
};

export class DisconnectedError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DisconnectedError.prototype);
  }
}

/**
 * A two way comuncation channel between two web browsers
 */
export class ChannelPeerJS<T> implements Channel<T> {
  private peer: Peer.Peer;
  private lastPeerId: string | null;
  private state: ChannelState;
  private conn: Peer.DataConnection | null;
  // Listeners
  private observable: Observable<Listener<T>>;
  //Msg queue
  private queue: Queue<any>;

  constructor() {
    const peerOptions: Peer.PeerJSOption = {
      secure: true,
      host: "signal-server-peerjs.herokuapp.com",
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

    this.lastPeerId = null;
    this.state = "Initalized";
    this.conn = null;
    this.observable = new Observable();
    this.queue = new Queue();
    // Used to avoid shadowing 'this'
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const channel = this;

    channel.peer.on("open", function () {
      // Workaround for peer.reconnect deleting previous id
      if (channel.peer.id === null && channel.lastPeerId) {
        // channel.peer.id = channel.lastPeerId;
      } else {
        channel.lastPeerId = channel.peer.id;
      }
      channel.updateOnStateChange("Waiting");
    });

    channel.peer.on("connection", function (c) {
      // Allow only a single connection
      channel.updateOnStateChange("Connected");

      if (channel.conn && channel.conn.open) {
        c.on("open", function () {
          // TODO: send a better error msg!
          c.send("Already connected to another client");
          setTimeout(function () {
            c.close();
          }, 500);
        });
        return;
      }
      channel.conn = c;
      channel.ready(c);
    });

    channel.peer.on("disconnected", function () {
      channel.updateOnStateChange("Reconnecting");

      // Workaround for peer.reconnect deleting previous id
      if (channel.lastPeerId) {
        // channel.peer.id = channel.lastPeerId;
        // channel.peer._lastServerId = channel.lastPeerId;
        // channel.peer.reconnect();
      }
    });
    channel.peer.on("close", function () {
      channel.conn = null;
      channel.updateOnStateChange("Destroyed");
    });

    channel.peer.on("error", function (err) {
      channel.conn = null;
      channel.updateOnErrorChange(err);
    });

    // If we know the peerID that means that that our peer is waiting for us
    // to make a connection.
  }

  connectTo(peerID: string): void {
    if (this.lastPeerId !== peerID) {
      this.conn = this.peer.connect(peerID);
      this.ready(this.conn);
      this.lastPeerId = peerID;
    }
  }

  /**
   * Triggered once a connection has been achieved.
   * Defines callbacks to handle incoming data and connection events.
   */
  private ready(conn: Peer.DataConnection): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const channel = this;
    conn.on("data", (data: any) => {
      this.observable.forEachObserver((listener) => {
        if (listener.kind === "Receive") {
          listener.fn(data);
        }
      });
    });
    conn.on("close", () => {
      channel.conn = null;
      channel.updateOnStateChange("Waiting");
      channel.queue.empty();
    });
    conn.on("open", () => {
      channel.updateOnStateChange("Connected");
      channel.flushMessages();
    });
    // channel.flushQueue()
  }

  destroy(): void {
    if (this.conn) {
      this.observable.deleteAllObservers();
      this.queue.empty();
      this.conn.close();
      this.peer.destroy();
    }
  }

  private updateOnStateChange(newState: ChannelState) {
    const oldState = this.state;
    this.state = newState;
    this.observable.forEachObserver((listener) => {
      if (listener.kind === "StateChange") {
        listener.fn(newState, oldState);
      }
    });
  }

  private updateOnErrorChange(error: any) {
    this.observable.forEachObserver((listener) => {
      if (listener.kind === "Error") {
        listener.fn(error);
      }
    });
  }

  /**
   * Send a signal via the peer connection and add it to the log.
   * This will only occur if the connection is still alive.
   *
   * Warning: throws DisconnectedError if connection is closed
   */
  send(data: any) {
    if (this.conn && this.conn.open) {
      this.conn.send(data);
    } else {
      throw new DisconnectedError("Connection is closed");
    }
  }

  sendSafe(data: any) {
    this.queue.add(data);
    this.flushMessages();
  }

  // Listeners

  onError(callFn: (data: any) => void): () => void {
    return this.observable.addObserver({
      kind: "Error",
      fn: callFn,
    });
  }

  onReceive(callFn: (data: T) => void): () => void {
    return this.observable.addObserver({
      kind: "Receive",
      fn: callFn,
    });
  }

  onStateChange(
    callFn: (state: ChannelState, previous: ChannelState) => void
  ): () => void {
    return this.observable.addObserver({
      kind: "StateChange",
      fn: callFn,
    });
  }
  /**
   *
   * @returns the current state of the channel
   */
  getState(): ChannelState {
    return this.state;
  }

  /**
   *
   * @returns the id of the channel
   */
  getID(): string {
    return this.peer.id;
  }

  private flushMessages() {
    if (this.conn && this.conn.open) {
      this.queue.flush((msg) => this.send(msg));
    }
  }
}
