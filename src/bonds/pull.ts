import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { env } from "node:process";
import { DuckDBInstance } from "@duckdb/node-api";
import { listAllRussianBonds } from "@grind-t/russian-bonds";
import { flatten } from "flat";

const bonds = await listAllRussianBonds(env.T_INVEST_READONLY_TOKEN);
const flatBonds = bonds.map((bond) => flatten(bond, { delimiter: "_" }));
const tmpFile = join(tmpdir(), `bonds-${Date.now()}.json`);

writeFileSync(tmpFile, JSON.stringify(flatBonds));

const db = await DuckDBInstance.create();
const conn = await db.connect();
const dataFile = join(import.meta.dirname, "data.parquet");

await conn.run(/*sql*/ `COPY '${tmpFile}'TO '${dataFile}'`);
