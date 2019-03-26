/**
 * Copyright 2018 OPEN-EYES S.r.l.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

module.exports = function(RED) {
  "use strict";

	function parse(buffer) {
		return {
			type: buffer.readUInt16LE(8),
			code: buffer.readUInt16LE(10),
			val:  buffer.readUInt32LE(12)
		}
	}

	// The main node definition - most things happen in here
	function GetIOSensor(n) {
		// Create a RED node
		RED.nodes.createNode(this,n);

		// Store local copies of the node configuration (as defined in the .html)
		var msg = { topic: "get-io" };
		this.device = "/dev/input/event2";
		this.evtype = 1; // EV_KEY
		var node = this;

		var FS = require("fs");

    node.status({fill: "green", shape: "dot", text: 'link'});

    var options = { flags: 'r',encoding: null,fd: null,autoClose: true };
    // This line opens the file as a readable stream
    var readStream = FS.createReadStream(this.device,options);

    readStream.on('data', function(buf){
      var readElement = parse(buf);

		  if (readElement != undefined ){
		    if(readElement.type==node.evtype ){
          var string_val;
          if(readElement.val)
            string_val="ON";
          else
            string_val="OFF";

          if(readElement.code==0x100) // BTN_0
            var mystring = "Input1=" + string_val;
          else if(readElement.code==0x101) // BTN_1
            var mystring = "Input2=" + string_val;
          else if(readElement.code==0x102) // BTN_2
            var mystring = "Output1=" + string_val;
          else if(readElement.code==0x103) // BTN_3
            var mystring = "Output2=" + string_val;
          else if(readElement.code==0x104) // BTN_4
            var mystring = "Eserr=" + string_val;
          else
            var mystring = "Unkown=" + string_val;

          msg.payload=mystring;
          node.send(msg);

		    }
		  }
    });

    readStream.on('error', function(e){
      node.status({fill: "red", shape: "dot", text: 'no device'});
      console.error(e);
    });

    this.on('close', function(readstream) {
      readstream.destroy();
		});

	}

	// Register the node by name. This must be called before overriding any of the
	// Node functions.
	RED.nodes.registerType("get-io",GetIOSensor);
}
