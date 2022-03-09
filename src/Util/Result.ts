export type Result<T, E = Error> = Ok<T> | Err<E>;

export type Ok<T> = { ok: true; value: T };
export type Err<E = Error> = { ok: false; error: E };

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value: value };
}

export function err<E>(value: E): Err<E> {
  return { ok: false, error: value };
}
