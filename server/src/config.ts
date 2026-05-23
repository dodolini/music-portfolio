import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
dotenv.config();

export const CONFIG = {
  ADMIN_USERNAME: process.env.ADMIN_USERNAME!,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH!,
  JWT_SECRET: process.env.JWT_SECRET!,
  PRIVATE_KEY: fs.readFileSync(path.join(__dirname, '../keys/private.key'), 'utf8'),
  PUBLIC_KEY: fs.readFileSync(path.join(__dirname, '../keys/public.key'), 'utf8'),
};
