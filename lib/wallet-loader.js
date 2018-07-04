var urljoin = require('url-join');
var networks = require('./lib/js/networks.js');

var WalletLoader = function(wallet, explorer) {
	var callback;

	var load = function(request) {
        switch (request.id) {
            case C.REQUEST_ADDR:
                // loadAddress(request.callback);
                break;
            case C.REQUEST_UNSPENT:
                loadUnspent(request.addresses, request.callback);
                break;
            case C.REQUEST_TX_HISTORY:
                // loadTxHistory(request.addresses, request.from, request.to, request.callback);
                break;
        }
    };

    var loadUnspent = function(addresses, cb) {
        callback = cb;
        checkUnspent(addresses)
    };

    function checkUnspent(addresses) {
        try {
            addresses = (addresses instanceof Array ? addresses : [addresses]).join(',');

            var params = {
                addrs: addresses
            };

            var endpoint = explorer.endpoints['unspent'].stringify(params);
            var apiUrl = urljoin(explorer.rootUrl, endpoint);            

            request.get(url).on('response', onCheckUnspentResult);
            
        } catch (err) {
            callback({
                isSuccess: false,
                requestId: C.REQUEST_UNSPENT
            });
        }
    }

    function onCheckUnspentResult (response) {
        var result = {
            isSuccess: false,
            requestId: C.REQUEST_UNSPENT
        };

        // if (response.state === 'success') {
        if(response.statusCode == 200){
            try {
                var sum_amount = 0;
                for(var idx in data) {
                    var unspent = data[idx];
                    if (existUnspent(unspent))
                        continue;

                    var unspent_value = {
                        "txid"         : unspent.txid,
                        "address"      : unspent.address,
                        "scriptPubKey" : unspent.scriptPubKey,
                        "balance"      : unspent.satoshis,
                        "path"         : getPathFromAddress(wallet, unspent.address),
                        "confirmations": unspent.confirmations,
                        "vout"         : unspent.vout
                    };

                    wallet.unspent_values.push(unspent_value);

                    sum_amount = sum_amount + unspent.amount;
                }

                wallet.balance = sum_amount;
                result['isSuccess'] = true;
                callback(result);
            } catch (e) {
                callback(result);
            }
        } else {
            callback(result);
        }
    }

    var existUnspent = function(unspent) {
        for(var idx in wallet.unspent_values) {
            var cachedUnspent = wallet.unspent_values[idx];
            if ((cachedUnspent.txid === unspent.txid)
                && (cachedUnspent.vout === unspent.vout)) {
                return true;
            }
        }

        return false;
    }

    function getPath(internal_path, external_path) {
        var bip_path = 0x8000002c;
        var coin_path = 0x800000c8;
        var account_path = 0x80000000;

        return bip_path + '/' + coin_path + '/' + account_path + '/' + internal_path + '/' + external_path;
    }

    function getPathFromAddress(wallet, address) {
        for (var idx in wallet.internal_addresses) {
            if (address === wallet.internal_addresses[idx].address) {
                return this.getPath(1, idx);
            }
        }

        for(idx in wallet.external_addresses) {
            if (address === wallet.external_addresses[idx].address) {
                return this.getPath(0, idx);
            }
        }

        return '';
    }
}

module.exports = WalletLoader;