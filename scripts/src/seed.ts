import * as fs from "node:fs";
import * as path from "node:path";
import * as XLSX from "xlsx";
import {
  db,
  pool,
  scenariosTable,
  lookupsTable,
  contatosTable,
  escalaTable,
  type InsertScenario,
  type InsertLookup,
  type InsertContato,
  type InsertEscala,
} from "@workspace/db";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const DIR = "/home/runner/workspace/attached_assets";

function findFile(substr: string): string {
  const matches = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".xlsx") && f.includes(substr));
  if (matches.length === 0)
    throw new Error(`No xlsx matching "${substr}" in ${DIR}`);
  if (matches.length > 1)
    throw new Error(
      `Ambiguous: ${matches.length} xlsx match "${substr}": ${matches.join(", ")}`,
    );
  return path.join(DIR, matches[0]!);
}

function readSheet(file: string, sheet: string): (string | null)[][] {
  const wb = XLSX.read(fs.readFileSync(file), { type: "buffer" });
  const ws = wb.Sheets[sheet];
  if (!ws) throw new Error(`Sheet "${sheet}" not found in ${file}`);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: null,
    blankrows: false,
  });
  return rows.map((r) =>
    (r as unknown[]).map((c) => {
      if (c == null) return null;
      const s = String(c).trim();
      return s === "" ? null : s;
    }),
  );
}

const chunk = <T>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

function parseScenarios(): { rows: (string | null)[][]; values: InsertScenario[] } {
  const file = findFile("Testes");
  const rows = readSheet(file, "Tabela Final Teste de Liberação");
  const body = rows.slice(1); // drop header
  const values: InsertScenario[] = [];
  for (const r of body) {
    const idTeste = r[1];
    if (!idTeste) continue; // idTeste is required
    values.push({
      idTeste,
      chaveamento: r[2],
      sequencia: r[3],
      blocoExecucao: r[4],
      fisicoSistemico: r[5],
      prioridade: r[6],
      cenario: r[7],
      dependenciaCenarioExterno: r[8],
      quemExecuta: r[9],
      baselineCustomizado: r[10],
      facilitador: r[11],
      keyUser: r[12],
      superUser: r[13],
      endUser: r[14],
      macroProcesso: r[15],
      sequenciaPassoAPasso: r[16],
      evidenciasObrigatorias: r[17],
      quemDefineMassa: r[18],
      massaDados: r[19],
      celula: r[20],
      agrupamento: r[21],
      tipoCenario: r[22],
      liberacao: r[23],
      observacoes: r[24],
      sistema: r[25],
      site: r[26],
      statusCenario: r[27],
      idDefeitoJira: r[28],
      idCenarioJira: r[29],
      statusCheckPoint: r[31],
      diretorio: r[32],
    });
  }
  return { rows: body, values };
}

// Derive domain lookups from distinct values found in scenario columns.
function parseLookups(scenarioRows: (string | null)[][]): InsertLookup[] {
  const colByCategory: Record<string, number> = {
    bloco_execucao: 4,
    prioridade: 6,
    quem_executa: 9,
    entregas: 10, // BASELINE / CUSTOMIZADO
    facilitador: 11,
    macro_processo: 15,
    sistema: 25,
    site: 26,
    status_cenario: 27,
  };

  const lookups: InsertLookup[] = [];
  for (const [category, col] of Object.entries(colByCategory)) {
    const seen = new Set<string>();
    for (const r of scenarioRows) {
      const v = r[col];
      if (v) seen.add(v);
    }
    const values = [...seen].sort((a, b) => a.localeCompare(b, "pt-BR"));
    values.forEach((value, i) => lookups.push({ category, value, ordem: i }));
  }
  return lookups;
}

function parseContatos(): InsertContato[] {
  const file = findFile("Escala");
  const rows = readSheet(file, "Lista de Contatos");
  const body = rows.slice(1); // drop header
  const contatos: InsertContato[] = [];
  for (const r of body) {
    const nome = r[0];
    const empresa = r[1];
    if (!nome || !empresa) continue; // both required
    contatos.push({
      nome,
      empresa,
      contato1: r[2],
      contato2: r[3],
      localidade: r[4],
      papel: r[5],
      email: r[6],
      escalonamento: r[7],
    });
  }
  return contatos;
}

// "Escala Implantação" is a person x time-slot grid; we seed the roster
// (pessoa / empresa / papel). col1=Nome, col2=Empresa, col3=Papel.
// Section labels (e.g. "Gestão da Release", company group headers) sit in the
// Nome column with empty empresa AND papel — require one of them to exclude those.
function parseEscala(): InsertEscala[] {
  const file = findFile("Escala");
  const rows = readSheet(file, "Escala Implantação");
  const escala: InsertEscala[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const pessoa = r[1];
    const empresa = r[2];
    const papel = r[3];
    if (!pessoa) continue;
    if (pessoa.toLowerCase() === "nome") continue; // header row
    if (!empresa && !papel) continue; // section/group label, not a person
    const key = pessoa.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    escala.push({ pessoa, empresa, papel });
  }
  return escala;
}

async function insertAll<T>(
  tx: Tx,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  values: T[],
): Promise<void> {
  for (const c of chunk(values, 200)) {
    await tx.insert(table).values(c);
  }
}

async function main() {
  const { rows: scenarioRows, values: scenarios } = parseScenarios();
  const lookups = parseLookups(scenarioRows);
  const contatos = parseContatos();
  const escala = parseEscala();

  await db.transaction(async (tx) => {
    await tx.delete(scenariosTable);
    await tx.delete(lookupsTable);
    await tx.delete(contatosTable);
    await tx.delete(escalaTable);

    await insertAll(tx, scenariosTable, scenarios);
    await insertAll(tx, lookupsTable, lookups);
    await insertAll(tx, contatosTable, contatos);
    await insertAll(tx, escalaTable, escala);
  });

  console.log(`Scenarios inserted: ${scenarios.length}`);
  console.log(`Lookups inserted: ${lookups.length}`);
  console.log(`Contatos inserted: ${contatos.length}`);
  console.log(`Escala inserted: ${escala.length}`);
  console.log("Seed complete.");
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => {});
  process.exit(1);
});
