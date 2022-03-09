import Observable from "../Util/Behavior/Observable";
import Queue from "../Util/Behavior/Queue";
import { Channel, ChannelState } from "./Channel";

export type ListenerKind = "StateChange" | "Receive";

type Listener<T> = StateChangeListener | ReceiveListener<T>;

type StateChangeListener = {
  kind: "StateChange";
  fn: (state: ChannelState, previous: ChannelState) => void;
};

type ReceiveListener<T> = {
  kind: "Receive";
  fn: (data: T) => void;
};

/**
 * Replicates the channel API but is entirly pure. It is usefull for testing.
 */
export class ChannelPure<T> implements Channel<T> {
  private id;
  private channelState: ChannelState;

  // Listeners
  private observable: Observable<Listener<T>>;
  //Msg queue
  private queue: Queue<any>;

  private conn: ChannelPure<T> | undefined;

  constructor(id: string) {
    this.id = id;
    this.channelState = "Initalized";
    this.queue = new Queue();
    this.observable = new Observable();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connectTo(_peerID: string): void {
    throw Error("MissingImplementation: connectTo is not implemented");
  }

  // ChannelPure specific
  connect(channel: ChannelPure<T>): void {
    if (
      this.channelState !== "Connected" &&
      this.channelState !== "Destroyed"
    ) {
      this.conn = channel;
      this.channelState = "Connected";
      this.flushMessages();
      this.channelStateChange(this.channelState);
    } else {
      throw Error(
        "Can not connect to channel since it is: " + this.channelState
      );
    }
  }

  private receiveData(data: T): void {
    this.observable.forEachObserver((listener) => {
      if (listener.kind === "Receive") {
        listener.fn(data);
      }
    });
  }

  private channelStateChange(channelState: ChannelState): void {
    const previous = this.channelState;
    this.channelState = channelState;
    this.observable.forEachObserver((listener) => {
      if (listener.kind === "StateChange") {
        listener.fn(channelState, previous);
      }
    });
    if (channelState === "Destroyed") {
      this.conn = undefined;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onError(callFn: (data: any) => void): () => void {
    throw Error("Have not implemented onError");
  }

  // Channel API
  destroy(): void {
    this.conn?.channelStateChange("Destroyed");
    this.channelStateChange("Destroyed");
    this.queue.empty();
  }

  send(data: T): void {
    this.conn?.receiveData(data);
  }

  sendSafe(data: T): void {
    this.queue.add(data);
    this.flushMessages();
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

  getState(): ChannelState {
    return this.channelState;
  }

  getID(): string {
    return this.id;
  }

  private flushMessages() {
    if (this.conn) {
      this.queue.flush((msg) => this.send(msg));
    }
  }
}
