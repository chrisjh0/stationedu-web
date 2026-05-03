export type ServiceOk<T> = { ok: true; data: T };
export type ServiceErr = { ok: false; status: number; error: string };
export type ServiceResult<T> = ServiceOk<T> | ServiceErr;

export function ok<T>(data: T): ServiceOk<T> {
  return { ok: true, data };
}

export function err(status: number, error: string): ServiceErr {
  return { ok: false, status, error };
}
