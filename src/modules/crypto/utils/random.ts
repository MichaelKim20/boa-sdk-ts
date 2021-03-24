import { randomBytes } from 'crypto';

export function randombytes_buf (n: number): Uint8Array
{
    const b = new Uint8Array(n);
    const v = randomBytes(n);

    for (let i = 0; i < n; i++)
    {
        b[i] = v[i];
        v[i] = 0;
    }
    return b;
}
