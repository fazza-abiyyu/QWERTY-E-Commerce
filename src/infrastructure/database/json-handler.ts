import { readJsonFile, writeJsonFile } from './storage';

export class JsonHandler<T> {
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }

  async readAll(): Promise<T[]> {
    return await readJsonFile<T[]>(this.filename, []);
  }

  async writeAll(data: T[]): Promise<void> {
    await writeJsonFile<T[]>(this.filename, data);
  }

  async findById(id: string | number): Promise<T | undefined> {
    const all = await this.readAll();
    return all.find((item: any) => item.id === id);
  }

  async insert(item: T): Promise<T> {
    const all = await this.readAll();
    all.push(item);
    await this.writeAll(all);
    return item;
  }

  async update(id: string | number, updatedItem: Partial<T>): Promise<T | null> {
    const all = await this.readAll();
    const index = all.findIndex((item: any) => item.id === id);
    if (index === -1) return null;

    all[index] = { ...all[index], ...updatedItem };
    await this.writeAll(all);
    return all[index];
  }

  async delete(id: string | number): Promise<boolean> {
    const all = await this.readAll();
    const index = all.findIndex((item: any) => item.id === id);
    if (index === -1) return false;

    all.splice(index, 1);
    await this.writeAll(all);
    return true;
  }
}
