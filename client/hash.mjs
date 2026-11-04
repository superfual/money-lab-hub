// Portable SHA-256 for browsers whose preview origin has no SubtleCrypto.
import {sha256,toUtf8Bytes} from 'ethers';
export const digest=text=>sha256(toUtf8Bytes(text));
