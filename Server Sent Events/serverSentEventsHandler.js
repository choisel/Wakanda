﻿application.removeHttpRequestHandler("/serverEvents", "serverSentEventsHandler.js", "sendServerEvents");application.addHttpRequestHandler("/serverEvents", "serverSentEventsHandler.js", "sendServerEvents");function sendServerEvents(httpRequest, httpResponse) {	var ref = 0;	var sseMgr = new SharedWorker('workers/ServerSentEventManager.js', 'sse');	var port = sseMgr.port;	var message;	// Specify that we'll send server events	httpResponse.contentType = "text/event-stream";	port.onmessage = function (event) {		message = event.data;        switch (message.type)        {            case "sendDatas":                message = message.message;                // We send the chunk that needs to be send now                httpResponse.sendChunkedData(message);				// For now, we need to release the wait for the response to be sent                application.exitWait();                // We wait again for the next datas                wait();                break;			case "ack":				ref = message.ref;				break;        }	};	// We register to tell to the SharedWorker to send us the message when it's fired	port.postMessage({type:"register"});	// Wait to keep the context alive	wait();}