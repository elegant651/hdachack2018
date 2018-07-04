module.exports = (app, chain) => {


	app.get('/getinfo', (req, res) => {
		chain.getInfo((err, info) => {
			if(err) {
				console.error("e:"+err);
				res.json({"error": err});
			}

			res.json(info);
		});		
	});
	

	app.post('/createStream', (req, res) => {
		const name = req.body.sname;

		chain.create({
			type: "stream",
			name: name,
			open: true
		});
	});

	app.post('/publish', (req, res) => {
		const sname = req.body.sname;
		const key = req.body.key;
		const data = req.body.sdata;

		chain.publish({
			stream: sname,
			key: key,
			data: new Buffer(data).toString("hex")
		}).then(() => {
			res.json({"flag": 1});
		}).catch((err) => {
			console.error(JSON.stringify(err));
			res.json({"flag": 0});
		})
	});

	app.post('/publishFrom', (req, res) => {
		const from = req.body.from;
		const sname = req.body.sname;
		const key = req.body.key;
		const data = req.body.sdata;

		chain.publish({
			from: from,
			stream: sname,
			key: key,
			data: new Buffer(data).toString("hex")
		}).then(() => {
			res.json({"flag": 1});
		}).catch((err) => {
			console.error(JSON.stringify(err));
			res.json({"flag": 0});
		})
	});

	app.post('/publishData', (req, res) => {
		const sname = req.body.sname;		
		const sdata = req.body.sdata;
		const stype = req.body.stype;

		const sobj = JSON.parse(sdata);

		let result = "";
		//serializing
		Object.keys(sobj).forEach((key) => {
			console.log(key +"/"+ sobj[key]);
			const skey = key;
			const sval = sobj[key];
			
			result += sval + "|";
		});

		// sname = "stream"+stype;

		chain.publish({
			stream: sname,
			key: "statekey",
			data: new Buffer(result).toString("hex")
		}).then((hexstring) => {
			res.json({"flag": 1, "data": hexstring});
		}).catch((err) => {
			console.error(JSON.stringify(err));
			res.json({"flag": 0});
		})			
		
	});


	app.get('/getdata/:sname', (req, res) => {
		const sname = req.params.sname;

		chain.subscribe({
			stream: sname
		}).then(() => {
			chain.listStreamKeyItems({
				stream: sname,
				key: "storekey",
				verbose: true
			}).then(streamKeyItems => {
				res.json({"flag":1, "data": streamKeyItems});
			}).catch((err) => {
				console.error(JSON.stringify(err));
				res.json({"flag": 0});
			})
		}).catch(e => {
			console.error("e:"+JSON.stringify(e));
			res.json({"flag": 0});
		});
	});


	app.post('/sendcoin', (req, res) => {
		const amount = req.body.amount;
		const from = req.body.from;
		const to = req.body.to;		
		
		chain.sendFromAddress({
    		from: from,
    		to: to,
    		amount: {
        		"": parseInt(amount)
    		}
		}).then(txid => {
			console.log(txid);
			res.json({"flag": 1, "data": txid});
		}).catch((err) => {
			console.error(JSON.stringify(err));
			res.json({"flag": 0});
		});
	});


	/* ref */
	app.get('/listKeys/:sname', (req, res) => {
		const sname = req.params.sname;

		chain.listStreamKeys({
			stream: sname
		}).then(streamKeys => {
			res.json({"flag":1, "data": streamKeys});
		}).catch((err) => {
			console.error(JSON.stringify(err));
			res.json({"flag": 0});
		})
	});

	app.get('/listKeyItems/:sname/:key', (req, res) => {
		const sname = req.params.sname;
		const key = req.params.key;

		chain.subscribe({
			stream: sname
		}).then(() => {
			chain.listStreamKeyItems({
				stream: sname,
				key: key,
				verbose: true
			}).then(streamKeyItems => {
				res.json({"flag":1, "data": streamKeyItems});
			}).catch((err) => {
				console.error(JSON.stringify(err));
				res.json({"flag": 0});
			})
		}).catch(e => {
			console.error("e:"+JSON.stringify(e));
			res.json({"flag": 0});
		});
	});

	// app.get('/getTxOutData/:txid', (req, res) => {
	// 	const txid = req.params.txid;

	// 	chain.getTxOutData({
	// 		txid: txid,
	// 		vout: 0
	// 	})
	// });

	app.get('/listStreamItems/:sname', (req, res) => {
		const sname = req.params.sname;

		chain.listStreamItems({
			stream: sname,
			verbose: true
		}).then((streamItems) => {
			res.json({"flag":1, "data": streamItems});
		}).catch((err) => {
			console.error(JSON.stringify(err));
			res.json({"flag": 0});
		})
	});

	// app.get('/listStreamPublisherItems/:sname/:from', (req, res) => {
	// 	const sname = req.params.sname;
	// 	const from = req.params.from;

	// 	chain.listStreamPublisherItems({
 //            stream: sname,
 //            address: from,
 //            verbose: true
 //        })
	// });

	app.get('/getStreamItem/:sname/:txid', (req, res) => {
		const sname = req.params.sname;
		const txid = req.params.txid;

		chain.getStreamItem({
            stream: sname,
            txid: txid
        }).then(item => {
        	res.json({"flag":1, "data": item});
        }).catch((err) => {
			console.error(JSON.stringify(err));
			res.json({"flag": 0});
		})
	});


	function hexToString (hex) {
	    let string = '';
	    for (let i = 0; i < hex.length; i += 2) {
	      string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	    }
	    return string;
	}

}