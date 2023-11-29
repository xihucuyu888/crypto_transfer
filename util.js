/**
 * @name u8aToHex
 * @summary Creates a hex string from a Uint8Array object.
 * @description
 * `UInt8Array` input values return the actual hex string. `null` or `undefined` values returns an `0x` string.
 * @example
 * <BR>
 *
 * ```javascript
 * import { u8aToHex } from '@polkadot/util';
 *
 * u8aToHex(new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0xf])); // 0x68656c0f
 * ```
 */
function u8aToHex(value, bitLength = -1, isPrefixed = true) {
    const U8 = new Array(256);
    const U16 = new Array(256 * 256);
    for (let n = 0; n < 256; n++) {
        U8[n] = n.toString(16).padStart(2, '0');
    }
    for (let i = 0; i < 256; i++) {
        const s = i << 8;
        for (let j = 0; j < 256; j++) {
            U16[s | j] = U8[i] + U8[j];
        }
    }
    /** @internal */
    function hex(value, result) {
        const mod = (value.length % 2) | 0;
        const length = (value.length - mod) | 0;
        for (let i = 0; i < length; i += 2) {
            result += U16[(value[i] << 8) | value[i + 1]];
        }
        if (mod) {
            result += U8[value[length] | 0];
        }
        return result;
    }

    // this is not 100% correct sinmce we support isPrefixed = false....
    const empty = isPrefixed
        ? '0x'
        : '';
    if (!value?.length) {
        return empty;
    }
    else if (bitLength > 0) {
        const length = Math.ceil(bitLength / 8);
        if (value.length > length) {
            return `${hex(value.subarray(0, length / 2), empty)}…${hex(value.subarray(value.length - length / 2), '')}`;
        }
    }
    return hex(value, empty);
}

/**
 * @name hexToU8a
 * @summary Creates a Uint8Array object from a hex string.
 * @description
 * `null` inputs returns an empty `Uint8Array` result. Hex input values return the actual bytes value converted to a Uint8Array. Anything that is not a hex string (including the `0x` prefix) throws an error.
 * @example
 * <BR>
 *
 * ```javascript
 * import { hexToU8a } from '@polkadot/util';
 *
 * hexToU8a('0x80001f'); // Uint8Array([0x80, 0x00, 0x1f])
 * hexToU8a('0x80001f', 32); // Uint8Array([0x00, 0x80, 0x00, 0x1f])
 * ```
 */
function hexToU8a(value, bitLength = -1) {
    const CHR = '0123456789abcdef';
    const U8 = new Uint8Array(256);
    const U16 = new Uint8Array(256 * 256);

    for (let i = 0, count = CHR.length; i < count; i++) {
        U8[CHR[i].charCodeAt(0) | 0] = i | 0;

        if (i > 9) {
            U8[CHR[i].toUpperCase().charCodeAt(0) | 0] = i | 0;
        }
    }

    for (let i = 0; i < 256; i++) {
        const s = i << 8;

        for (let j = 0; j < 256; j++) {
            U16[s | j] = (U8[i] << 4) | U8[j];
        }
    }

    if (!value) {
        return new Uint8Array();
    }

    let s = value.startsWith('0x')
        ? 2
        : 0;

    const decLength = Math.ceil((value.length - s) / 2);
    const endLength = Math.ceil(
        bitLength === -1
            ? decLength
            : bitLength / 8
    );
    const result = new Uint8Array(endLength);
    const offset = endLength > decLength
        ? endLength - decLength
        : 0;

    for (let i = offset; i < endLength; i++, s += 2) {
        // The big factor here is actually the string lookups. If we do
        // HEX_TO_U16[value.substring()] we get an 10x slowdown. In the
        // same vein using charCodeAt (as opposed to value[s] or value.charAt(s)) is
        // also the faster operation by at least 2x with the character map above
        result[i] = U16[(value.charCodeAt(s) << 8) | value.charCodeAt(s + 1)];
    }

    return result;
}

module.exports = {
    u8aToHex,
    hexToU8a
}