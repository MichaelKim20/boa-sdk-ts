import * as nacl from 'tweetnacl-ts';

export function crypto_sign_ed25519_sk_to_curve25519 (ed25519_sk: Uint8Array): Uint8Array
{
    let h = nacl.hash(ed25519_sk.slice(0, 32));
    h[ 0] &= 248;
    h[31] &= 127;
    h[31] |=  64;
    return h.slice(0, 32);
}
