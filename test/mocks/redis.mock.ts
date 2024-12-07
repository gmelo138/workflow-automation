export class RedisMock {
  private store: { [key: string]: string } = {};

  async get(key: string): Promise<string | null> {
    return this.store[key] || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    this.store[key] = value;
    return 'OK';
  }
}