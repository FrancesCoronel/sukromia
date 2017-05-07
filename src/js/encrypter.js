/**
 * Public key: n,e
 * @param text
 * @param key [JSON string]
 * @return encrypted text
 */
function encrypt(text, key) {
    console.log(key);
    key = JSON.parse(key);
    var output = "";
    for (var i = 0; i < text.length; i++) {
        var m = processorTool.char2Num(text.charAt(i));
        var mE = processorTool.num2Char(RSA.encrypt(m, key.n, key.e));
        output += mE;
    }
    return output;
}

/**
 * Private key: n,d
 * @param text
 * @param publicKey [JSON string]
 * @return decrypted text
 */
function decrypt(text, publicKey) {
    var key = JSON.parse(publicKey);
    var output = "";
    for (var i = 0; i < text.length; i++) {
        var m = processorTool.char2Num(text.charAt(i));
        var mE = processorTool.num2Char(RSA.decrypt(m, key.d, key.n));
        output += mE;
    }
    return output;
}