'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2UqcwgqhvrqF9bYLzoyA
LBDM/zujGJ7XNzU83Vi72Y6tfJ3hotQED94vy5ns4phTVtl2Qb9OWqTLQ3SpnHwG
9SjctdjcNhuob4caCNeL18rYB9MyIrJEvCHgiwYQTJabiBKasISo3Jka5NcqMijm
WOrWNwN0qKUEOGG6xHqcxSbyt3Y0Xw8fcgZpiZa0R4BVl/fFwLkYlFAz3MUqY109
AytoU+H/IVzJg/nGsT1ScWzhK94hc6Fuci8Uuc0YA9nBkkIx2AzmhG2mvaXyqn2t
Z+NqPNcRDtSAkedgpXyFGNjz2sfuMuTyn+u3/ZR096L25U9Q4U+8VWZz7yerbsXB
kQIDAQAB
-----END PUBLIC KEY-----
`

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return false;

  try {
    jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
    return true;
  } catch {
    return false;
  }
}