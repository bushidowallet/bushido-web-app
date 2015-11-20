// BigInteger monkey patching
BigInteger.valueOf = nbv;

/**
 * Returns a byte array representation of the big integer.
 *
 * This returns the absolute of the contained value in big endian
 * form. A value of zero results in an empty array.
 */
BigInteger.prototype.toByteArrayUnsigned = function () {
    var ba = this.abs().toByteArray();
    if (ba.length) {
        if (ba[0] == 0) {
            ba = ba.slice(1);
        }
        return ba.map(function (v) {
            return (v < 0) ? v + 256 : v;
        });
    } else {
        // Empty array, nothing to do
        return ba;
    }
};

/**
 * Turns a byte array into a big integer.
 *
 * This function will interpret a byte array as a big integer in big
 * endian notation and ignore leading zeros.
 */
BigInteger.fromByteArrayUnsigned = function (ba) {
    if (!ba.length) {
        return ba.valueOf(0);
    } else if (ba[0] & 0x80) {
        // Prepend a zero so the BigInteger class doesn't mistake this
        // for a negative integer.
        return new BigInteger([0].concat(ba));
    } else {
        return new BigInteger(ba);
    }
};

/**
 * Created by Jesion on 2015-02-10.
 */
var Util;

(function() {

    Util = {
        // Convert a byte array to a hex string
        bytesToHex: function (bytes) {
            for (var hex = [], i = 0; i < bytes.length; i++) {
                hex.push((bytes[i] >>> 4).toString(16));
                hex.push((bytes[i] & 0xF).toString(16));
            }
            return hex.join("");
        },
        // Convert a hex string to a byte array
        hexToBytes: function (hex) {
            for (var bytes = [], c = 0; c < hex.length; c += 2)
                bytes.push(parseInt(hex.substr(c, 2), 16));
            return bytes;
        },
        isArray: Array.isArray || function(o)
        {
            return Object.prototype.toString.call(o) === '[object Array]';
        },
        sha256ripe160: function (data) {
            return Crypto.RIPEMD160(Crypto.SHA256(data, {asBytes: true}), {asBytes: true});
        }
    };

})();