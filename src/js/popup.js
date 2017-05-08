$(document).ready(function() {

    /**
     * Generates and returns a random password.
     * @return A password consisting of 20 random characters.
     */
    function randomPass() {
        var pass = "";

        for (i = 0; i < 20; i++) {
            pass += String.fromCharCode(Math.floor(33 + 94 * Math.random()));
        }

        return pass;
    }

    /**
     * Copies the text in the #text element into the clipboard.
     */
    function copyText() {
        document.getElementById("text").select();
        document.execCommand("copy");
    }

    /**
     * Gets the cipher saved in the options.
     * @return A jQuery promise that's resolved with the cipher string.
     */
    function getCipher() {
        var d = $.Deferred();
        d.resolve("AES");
        return d.promise();
    }

    function uint8ArrayToString(uint8View) {
        return String.fromCharCode.apply(null, uint8View);
    }

    function stringToUint8Array(string) {
        var uint8View = new Uint8Array(string.length);
        for (var i = 0, strLen = string.length; i < strLen; i++) {
            uint8View[i] = string.charCodeAt(i);
        }
        return uint8View;
    }

    function wordArrayToArrayBuffer(wordArray) {
        // Create buffer
        var arrayBuffer = new ArrayBuffer(wordArray.sigBytes);
        var uint8View = new Uint8Array(arrayBuffer);

        // Copy data into buffer
        for (var i = 0; i < wordArray.sigBytes; i++) {
            uint8View[i] = (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }

        return arrayBuffer;
    }

    /*
     * Encrypt an ArrayBuffer with the given cipher and passphrase
     *
     * @param cipher One of 'AES', 'DES', 'TripleDES', 'Rabbit', 'RC4', or 'RC4Drop'.
     * @param plaintextArrayBuffer The ArrayBuffer to be encrypted.
     * @param passphrase The string to use to encrypt the plaintext.
     * @return An ArrayBuffer of the encrypted data.
     */
    function encryptArrayBuffer(cipher, plaintextArrayBuffer, passphrase) {
        var plainWordArray = CryptoJS.lib.WordArray.create(new Uint8Array(plaintextArrayBuffer));
        var cipherParams = CryptoJS[cipher].encrypt(plainWordArray, passphrase);

        // Make an ArrayBuffer of the ciphertext
        var ciphertextArrayBuffer = new Uint8Array(wordArrayToArrayBuffer(cipherParams.ciphertext));

        // Goal: Put cipherParams.iv.toString() and cipherParams.salt.toString() into ciphertextArrayBuffer

        // Assuming iv size is always 32 bytes: 32 hex characters
        // Assuming salt size is always 16 bytes: 16 hex characters
        var ivSaltArrayBuffer = new Uint8Array(32 + 16);
        ivSaltArrayBuffer.set(stringToUint8Array(cipherParams.iv.toString()));
        ivSaltArrayBuffer.set(stringToUint8Array(cipherParams.salt.toString()), 32);

        // Concatenate the two ArrayBuffers, storing iv and salt in the last 32 + 16 = 48 bytes
        var arrayBuffer = new ArrayBuffer(ciphertextArrayBuffer.length + ivSaltArrayBuffer.length);
        var uint8View = new Uint8Array(arrayBuffer);
        uint8View.set(ciphertextArrayBuffer);
        uint8View.set(ivSaltArrayBuffer, ciphertextArrayBuffer.length);

        return arrayBuffer;
    }

    /*
     * Decrypt a ArrayBuffer with the given cipher and passphrase
     *
     * @param cipher one of 'AES', 'DES', 'TripleDES', 'Rabbit', 'RC4', or 'RC4Drop'
     * @param ciphertextArrayBuffer the ArrayBuffer to be decrypted
     * @param passphrase the string to use to decrypt the plaintext
     * @return a ArrayBuffer of the decrypted data
     */
    function decryptArrayBuffer(cipher, ciphertextArrayBuffer, passphrase) {
        // Assuming iv and salt are stored in the last 32 + 16 = 48 bytes
        var ciphertextView = new Uint8Array(ciphertextArrayBuffer, 0, ciphertextArrayBuffer.byteLength - 48);
        var ivView = new Uint8Array(ciphertextArrayBuffer, ciphertextArrayBuffer.byteLength - 48, 32);
        var saltView = new Uint8Array(ciphertextArrayBuffer, ciphertextArrayBuffer.byteLength - 48 + 32, 16);

        // Create the CipherParams
        var cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.lib.WordArray.create(ciphertextView),
            iv: CryptoJS.enc.Hex.parse(uint8ArrayToString(ivView)),
            salt: CryptoJS.enc.Hex.parse(uint8ArrayToString(saltView))
        });

        // Decrypt to get a wordArray of the plaintext
        var plainWordArray = CryptoJS[cipher].decrypt(cipherParams, passphrase);

        // Return an array buffer
        return wordArrayToArrayBuffer(plainWordArray);
    }

    function encryptString(cipher, plaintext, passphrase) {
        return CryptoJS[cipher].encrypt(plaintext, passphrase).toString();
    }

    function decryptString(cipher, ciphertext, passphrase) {
        return CryptoJS[cipher].decrypt(ciphertext, passphrase).toString(CryptoJS.enc.Utf8);
    }

    $("#encrypt").click(function() {
        if ($("#text").val().length) {
            getCipher().done(function(cipher) {
                var ciphertext = encryptString(cipher, $("#text").val(), $("#passphrase").val());
                $("#text").val(ciphertext);
                copyText();
            });
        } else {
            alert("Please enter some text to encrypt first.");
        }
    });

    $("#decrypt").click(function() {
        if ($("#text").val().length) {
            getCipher().done(function(cipher) {
                var plaintext = decryptString(cipher, $("#text").val(), $("#passphrase").val());
                $("#text").val(plaintext);
                copyText();
            });
        } else {
            alert("Please enter text to decrypt first.");
        }
    });

    $("#random").click(function() {
        $('#passphrase').val(randomPass());
    });

    $("#copy").click(function() {
        copyText();
    });

    $("#clear").click(function() {
        $("#text").val("");
        $("#passphrase").val("");
    });


});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type == "selectionText") {
        $("#text").val(message.text);
    }
});
