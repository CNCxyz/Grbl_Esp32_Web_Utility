'use strict';

/*
 * Based on code written by Yaakov.
 */
 
async function serialWrite(writer, text) {
    await writer.write(text);
	await writer.write("\r\n");
}

async function serialRead(reader) {
    let response = '';

    while (!RegExp('[\r\n]$').test(response)) {
        let data = await reader.read();
        
        if (data.value !== undefined) {
            response += data.value;
        }

		if ((data.done === true)) {
            break;
        }
    }

    return response;
}

async function serialWriteAndRead(reader, writer, command) {
	
	console.log("Write: " + command);
    await serialWrite(writer, command);
    let response = await serialRead(reader);
		
	response = response.split(RegExp("[\r\n]"));
	response = response[0];
	var response2 = response.split("=");
	response2 = response2[response2.length - 1];
	
	if(command == '$' && response.includes("HLP")){
		console.log("Read: " + response);
		return response;
	}else if(command.includes("=") && response.includes("ok")) {
		console.log("Read: " + response);
		return response;
	}else if(!command.includes("=") && response2 && response.includes(command)){
		console.log("Read: " + response2);
		return response2;	
	}

	//Read was not successful, try again.
	return await serialWriteAndRead(reader, writer, command);
        
}

async function serialClose() {
    await this.reader.cancel();
    await this.inputDone.catch(() => {});

    await this.writer.close();
    await this.outputDone;

    await this.port.close();
}

async function serialConnect(port) {
    await port.open({ baudRate: 115200 });

    const decoder = new TextDecoderStream();
    const inputDone = port.readable.pipeTo(decoder.writable);
    const inputStream = decoder.readable;

    const reader = inputStream.getReader();

    const encoder = new TextEncoderStream();
    const outputDone = encoder.readable.pipeTo(port.writable);
    const outputStream = encoder.writable;

    const writer = outputStream.getWriter();

    return {
        port: port,
        reader: reader,
        writer: writer,

        write: serialWrite.bind(undefined, writer),
        read: serialRead.bind(undefined, reader),
        send: serialWriteAndRead.bind(undefined, reader, writer),
        close: serialClose,

        inputDone: inputDone,
        outputDone: outputDone,
        outputStream: outputStream,
    }
}