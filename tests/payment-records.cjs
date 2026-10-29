const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict');
(async()=>{const {PGlite}=require('@electric-sql/pglite');const pg=new PGlite();await pg.exec("CREATE SCHEMA spaceops;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE spaceops_runtime;GRANT USAGE ON SCHEMA spaceops TO spaceops_runtime;CREATE FUNCTION spaceops.actor_role() RETURNS text LANGUAGE sql AS $$SELECT current_setting('spaceops.role',true)$$;");
await pg.exec(fs.readFileSync('docs/PAYMENT-RECORDS-PREVIEW.sql','utf8'));
await pg.exec("SET ROLE spaceops_runtime;SET spaceops.role='owner';INSERT INTO spaceops.payment_records VALUES('a','{}','2026-10-29');");
await pg.exec("SET spaceops.role='manager'");assert.equal((await pg.query('SELECT * FROM spaceops.payment_records')).rows.length,1);await assert.rejects(()=>pg.exec("INSERT INTO spaceops.payment_records VALUES('b','{}','x')"));
await pg.exec("SET spaceops.role='staff'");assert.equal((await pg.query('SELECT * FROM spaceops.payment_records')).rows.length,0);
await pg.exec("SET spaceops.role='owner'");assert.equal((await pg.query('SELECT * FROM spaceops.payment_records')).rows.length,1);await assert.rejects(()=>pg.exec("DELETE FROM spaceops.payment_records"));await pg.close();
console.log('PASS: new payment-record SQL owner writes, manager reads only, staff blocked, runtime cannot delete history.');
})().catch(e=>{console.error(e);process.exitCode=1});
