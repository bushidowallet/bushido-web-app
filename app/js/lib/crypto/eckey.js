ECKey = (function () {

  var ecparams = getSECCurveByName("secp256k1");

  var ECKey = function (input) {
    if (Util.isArray(input)) {
      this.priv = BigInteger.fromByteArrayUnsigned(input);
    }
  };

  ECKey.prototype.setCompressed = function (v) {
    this.compressed = !!v;
  };

  ECKey.prototype.getPubPoint = function () {
    if (!this.pub) this.pub = ecparams.getG().multiply(this.priv);

    return this.pub;
  };

  return ECKey;
})();
