/**
 * Created by Jesion on 2015-02-09.
 */
var ExtendedKey;

(function() {

    ExtendedKey = function(keyHash, compressed) {
        if (keyHash != null) {
            var lhex = keyHash.slice(0, 64);
            var rhex = keyHash.slice(64, 128);
            var l = Util.hexToBytes(keyHash.slice(0, 64));
            var r = Util.hexToBytes(keyHash.slice(64, 128));
            var ecKey = new ECKey(l);
            ecKey.pub = ecKey.getPubPoint();
            ecKey.setCompressed(compressed);
            ecKey.pubKeyHash = Util.sha256ripe160(ecKey.pub.getEncoded(compressed));
            this.ecKey = ecKey;
            this.chainCode = r;
            this.parentFingerprint = Util.hexToBytes("00000000");
            this.version = 0x0488ade4;
            this.depth = 0;
            this.childIndex = 0;
        }
        return {
            'getPrivateKey': this.getPrivateKey,
            'serializePrivate': this.serializePrivate,
            'getWif': this.getWif,
            'derive': this.derive,
            'version': this.version,
            'depth': this.depth,
            'parentFingerprint': this.parentFingerprint,
            'childIndex': this.childIndex,
            'chainCode': this.chainCode,
            'ecKey': this.ecKey
        };
    }

    ExtendedKey.prototype.getPrivateKey = function() {
        var p = [];
        var v = this.version;
        p.push(v >> 24);
        p.push((v >> 16) & 0xff);
        p.push((v >> 8) & 0xff);
        p.push(v & 0xff);
        p.push(this.depth);
        p = p.concat(this.parentFingerprint);
        p.push(this.childIndex >>> 24);
        p.push((this.childIndex >>> 16) & 0xff);
        p.push((this.childIndex >>> 8) & 0xff);
        p.push(this.childIndex & 0xff);
        p = p.concat(this.chainCode);
        p.push(0);
        var k = this.ecKey.priv.toByteArrayUnsigned();
        while (k.length < 32) {
            k.unshift(0);
        }
        p = p.concat(k);
        return p;
    }

    ExtendedKey.prototype.serializePrivate = function (keyBytes) {
        var hash = Crypto.SHA256( Crypto.SHA256( keyBytes, { asBytes: true } ), { asBytes: true } );
        var checksum = hash.slice(0, 4);
        var data = keyBytes.concat(checksum);
        return Base58.encode(data);
    }

    ExtendedKey.prototype.derive = function (i) {
        var ib = [];
        ib.push( (i >> 24) & 0xff );
        ib.push( (i >> 16) & 0xff );
        ib.push( (i >>  8) & 0xff );
        ib.push( i & 0xff );
        var ecparams = getSECCurveByName("secp256k1");
        var data = this.ecKey.pub.getEncoded(this.ecKey.compressed).concat(ib);

        var j = new jsSHA(Crypto.util.bytesToHex(data), 'HEX');
        var hash = j.getHMAC(Crypto.util.bytesToHex(this.chainCode), "HEX", "SHA-512", "HEX");
        var l = new BigInteger(hash.slice(0, 64), 16);
        var r = Crypto.util.hexToBytes(hash.slice(64, 128));
        var curve = ecparams.getCurve();
        var k = l.add(this.ecKey.priv).mod(ecparams.getN());

        child = new ExtendedKey();
        child.chainCode  = r;
        child.ecKey = new ECKey(k.toByteArrayUnsigned());
        child.ecKey.pub = child.ecKey.getPubPoint();

        child.childIndex = i;
        child.parentFingerprint = this.ecKey.pubKeyHash.slice(0,4);
        child.version = this.version;
        child.depth = this.depth + 1;
        child.ecKey.setCompressed(this.ecKey.compressed);
        child.ecKey.pubKeyHash = Util.sha256ripe160(child.ecKey.pub.getEncoded(this.ecKey.compressed));

        return child;
    }

    ExtendedKey.prototype.getWif = function() {
        var bytes;
        if (this.ecKey.compressed == true) {
            bytes = [0+0x80].concat(this.ecKey.priv.toByteArrayUnsigned()).concat([1]);
        }   else {
            bytes = [0+0x80].concat(this.ecKey.priv.toByteArrayUnsigned());
        }
        var checksum = Crypto.SHA256(Crypto.SHA256(bytes, {asBytes: true}), {asBytes: true}).slice(0, 4);
        return Base58.encode(bytes.concat(checksum));
    }

})();
