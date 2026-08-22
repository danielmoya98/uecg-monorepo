import 'dotenv/config';
import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL;
const client = new Client({ connectionString });

async function main() {
  await client.connect();
  const res = await client.query('SELECT COUNT(*) FROM "class_periods"');
  console.log(`📊 Total ClassPeriods in DB: ${res.rows[0].count}`);

  const details = await client.query('SELECT * FROM "class_periods"');
  console.log('ClassPeriods details:', JSON.stringify(details.rows, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await client.end();
  });
