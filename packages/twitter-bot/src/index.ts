import path from 'path';
import { existsSync, writeFileSync } from 'fs';
import { config } from 'dotenv';
import { connect } from 'mongoose';
import { createLog } from './lib/helpers';
import App from './app';
import isDocker from './lib/isDocker';

global.logFile = path.join(__dirname, '/../log.txt');
global.logJson = path.join(__dirname, '/../log.json');

config({
	path: isDocker() ? '/usr/praise/.env' : path.resolve(__dirname, '../../../.env'),
});

const { MONGO_ADMIN_URI } = process.env;

main().catch(console.log);

async function main() {
	try {
		await connect(MONGO_ADMIN_URI);
		const logExists = existsSync(global.logFile);
		if (!logExists) {
			writeFileSync(global.logFile, '');
		}
		await App();
	} catch (error) {
		createLog(error, 'main');
	}
}
