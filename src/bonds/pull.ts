import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { env } from "node:process";
import { DuckDBInstance } from "@duckdb/node-api";
import { listAllRussianBonds } from "@grind-t/russian-bonds";
import { flatten } from "flat";
import { TInvestApi, tInvestNumber } from "@grind-t/t-invest";

const tInvestApi = new TInvestApi(env.T_INVEST_READONLY_TOKEN)
const tmpFile = join(tmpdir(), `bonds-${Date.now()}.json`);
const dataFile = join(import.meta.dirname, "data.parquet");

const [db, portfolio, bonds] = await Promise.all([
  DuckDBInstance.create().then(v => v.connect()),
  tInvestApi.operations.getPortfolio({accountId: env.T_INVEST_ACCOUNT_ID}),
  listAllRussianBonds(env.T_INVEST_READONLY_TOKEN), 
]);

const data = bonds.map((bond) => {
  const position = portfolio.positions.find((v) => v.ticker === bond.isin)
  const flattendBond = flatten(bond, { delimiter: "_" }) as any

  if (position) {
    const quantity = position.quantity ? tInvestNumber(position.quantity) : 0
    const avgPrice = position.averagePositionPrice ? tInvestNumber(position.averagePositionPrice) : 0
    flattendBond.total_invested = quantity * avgPrice
  }

  return flattendBond
})

writeFileSync(tmpFile, JSON.stringify(data));

await db.run(/*sql*/ `COPY '${tmpFile}'TO '${dataFile}'`);
