function encryptKey(text) {
    var num = text.length;
    var key = "";
    for (var i = num + (num / 5); i < 110 + 3 * (num / 7); i += num) {
        key += processorTool.num2Char(i) + "";
    }
    return encrypt(text, key);
}

function encrypt(text, key) {
    var output = "";
    for (var i = 0; i < text.length; i++) {
        var textChar = text.charAt(i);
        var char2Num1 = processorTool.char2Num(textChar);
        var keyChar = key.charAt(i % key.length);
        var char2Num2 = processorTool.char2Num(keyChar);
        var ch = processorTool.num2Char(char2Num1 + char2Num2);
        output += ch + "";
    }
    return output;
}

function mkKey() {
    var keyData = RSA.generate();
    var xd = keyData.d;
    var xn = keyData.n;
    var xe = keyData.e;
    var privateKey = {
        "d": xd,
        "n": xn
    };
    var privateKeyJSONString = JSON.stringify(privateKey);
    var publicKey = {
        "e": xe,
        "n": xn
    };
    var publicKeyJSONString = JSON.stringify(publicKey);
    document.getElementById("publicKey").innerHTML = publicKeyJSONString;
    document.getElementById("txtPrivateKey").innerHTML = privateKeyJSONString;
}
