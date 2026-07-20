import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { DuckDBConnection } from "@duckdb/node-api";
import { flatten } from "flat";

export async function saveParquet(path: string, data: unknown[]): Promise<void> {
  const conn = await DuckDBConnection.create();
  const srcFile = join(tmpdir(), `micro-bank-${randomUUID()}.json`);
  const content = JSON.stringify(data.map((v) => flatten(v)));

  await writeFile(srcFile, content);

  await conn.run(/*sql*/ `COPY '${srcFile}'TO '${path}'`);
}
