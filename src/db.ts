import fs from 'fs';

let data = null;

export interface DBConnection {
  put(record: { [key: string]: any }): Promise<void>;
  getAll<T>(): Promise<T[]>;
  getById<T>(id: number): Promise<T | null>;
  getByColumn<T>(column: string, value: string | number, decrypt?: (val: string | number) => string | number): Promise<T | null>;
  updateById(record: { [key: string]: any }): Promise<boolean>;
  deleteById (id: number): Promise<boolean>;
  close(): Promise<void>;
}

let connectionsCount = 0

export async function createConnection(): Promise<DBConnection> {
  connectionsCount += 1;
  if (connectionsCount === 0 && !fs.existsSync(process.env.DB_FILE_NAME)) {
    fs.closeSync(fs.openSync(process.env.DB_FILE_NAME, 'w'));
    data = []
  } else if (data === null) {
    data = fs.readFileSync(process.env.DB_FILE_NAME, { encoding: 'utf8' })
      .split('\n').slice(0, -1)
      .map((record) => JSON.parse(record));
  }

  return {
    async put(record: { [key: string]: any }): Promise<void> {
      const id = data.length ? data[data.length - 1].id + 1 : 1;
      const newRecord = {
        id,
        ...record,
      };
      fs.appendFileSync(process.env.DB_FILE_NAME, `${JSON.stringify(newRecord)}\n`);
      data.push(newRecord);
    },
    async getAll<T>(): Promise<T[]> {
      return data;
    },
    async getById<T>(id: number): Promise<T | null> {
      return data.find((record) => record.id === id) || null;
    },
    async getByColumn<T>(column: string, value: number | string, decrypt = (val: string | number) => val): Promise<T | null> {
      return data.find((record) => decrypt(record[column]) === value) || null;
    },
    async updateById(newRecord: { id: number, [key: string]: any }): Promise<boolean> {
      const record = data.find((record) => record.id === newRecord.id) || null;

      if (!record) {
        return false
      }
      const index = data.indexOf(record);
      const newData = [...data];
      newData[index] = { ...record, ...newRecord };

      fs.writeFileSync(process.env.DB_FILE_NAME, `${newData.map((record) => JSON.stringify(record)).join('\n')}\n`);
      data = newData;

      return true
    },
    async deleteById(id: number): Promise<boolean> {
      const newData = data.filter((record) => record.id !== id);

      if (newData.length === data.length) {
        return false;
      }

      fs.writeFileSync(process.env.DB_FILE_NAME, `${newData.map((record) => JSON.stringify(record)).join('\n')}\n`);
      data = newData;

      return true;
    },
    async close(): Promise<void> {
      connectionsCount -= 1;
    }
  }
}