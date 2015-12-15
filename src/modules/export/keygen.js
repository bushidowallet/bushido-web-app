/**
 * Created by Jesion on 2015-02-09.
 */
var KeyGen;

(function() {

    KeyGen = function(compressed) {
        this.compressed = compressed;
        return {
            'run': this.run,
            'compressed': this.compressed
        };
    };

    KeyGen.prototype.run = function(data, root) {
        var account = data.account;
        var sequence = data.sequence;
        var child = root.derive(account).derive(0).derive(sequence);
        return child.getWif();
    };

})();