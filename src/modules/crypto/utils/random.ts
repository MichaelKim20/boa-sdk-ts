import { randomBytes } from 'crypto';

export function randombytes_buf (n: number): Uint8Array
{
    return Uint8Array.from(randomBytes(n));
}
