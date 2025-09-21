interface ICacheRepository {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => void;
  delete: (key: string) => Promise<void>;
  setWithExpiry: (key: string, value: string, expiry: number) => void;
  scanIterator: (key: string) => AsyncIterable<string[], void, unknown>;
}

export default ICacheRepository;
