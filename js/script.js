'use strict';

let serialPort = null;    
let port = null;    
let currentSettings = null;
let changedSettings = null;

//Data array.
function grblSettings() {
    this.radioMode = null;
    this.wifiSSID = null;
    this.wifiPassword = null;
    this.wifiIPMode = null;
    this.wifiIP = null;
    this.apSSID = null;
    this.apPassword = null;
    this.apIP = null;
    this.apChannel = null;
    this.wifiGateway = null;
    this.wifiNetmask = null;
}

function enableForms(){
	$("#connect").text("Disonnect");
	$("#connect").removeClass("btn--blue-2");
	$("#connect").addClass("btn--red");
	$("#disconnected").hide();
	$("#connected").show();
	$("#update").hide();
}

function disableForms(){
	$("#connect").text("Connect");
	$("#connect").addClass("btn--blue-2");
	$("#connect").removeClass("btn--red");
	$("#disconnected").show();
	$("#connected").hide();
	$("#update").hide();
}

async function refreshSerialData() {
	
	currentSettings = new grblSettings();
	
	currentSettings.radioMode = await Promise.race([ port.send("$Radio/Mode"), timeout(500) ]);
	currentSettings.wifiSSID = await Promise.race([ port.send("$Sta/SSID"), timeout(500) ]);
	currentSettings.wifiPassword = await Promise.race([ port.send("$Sta/Password"), timeout(500) ]);
	currentSettings.wifiIPMode = await Promise.race([ port.send("$Sta/IPMode"), timeout(500) ]);
	currentSettings.apSSID = await Promise.race([ port.send("$AP/SSID"), timeout(500) ]);
	currentSettings.apPassword = await Promise.race([ port.send("$AP/Password"), timeout(500) ]);
	currentSettings.apIP = await Promise.race([ port.send("$AP/IP"), timeout(500) ]);
	currentSettings.apChannel = await Promise.race([ port.send("$AP/Channel"), timeout(500) ]);
	currentSettings.wifiGateway = await Promise.race([ port.send("$Sta/Gateway"), timeout(500) ]);
	currentSettings.wifiNetmask = await Promise.race([ port.send("$Sta/Netmask"), timeout(500) ]);
	currentSettings.wifiIP = await Promise.race([ port.send("$Sta/IP"), timeout(500) ]);
	
	if(changedSettings === null){
		changedSettings = new grblSettings();
	}
	changedSettings = Object.assign({}, currentSettings);	
		
}

async function updateFormData(){
	
	if(changedSettings.radioMode == 'STA'){
		$('#STA').prop("checked", true);
		$('#AP').prop("checked", false);
		$("#ssid").val(changedSettings.wifiSSID);
		$("#password").val(changedSettings.wifiPassword);
		if(changedSettings.wifiIPMode == 'DHCP'){
			$('#dhcp').prop("checked", true);
			$('#static').prop("checked", false);
		}else if(changedSettings.wifiIPMode == 'Static'){
			$('#static').prop("checked", true);
			$('#dhcp').prop("checked", false);
		}
		$("#ipAddress").val(changedSettings.wifiIP);
		$("#gateway").val(changedSettings.wifiGateway);
		$("#netmask").val(changedSettings.wifiNetmask);
	} else if(changedSettings.radioMode == 'AP'){
		$('#AP').prop("checked", true);
		$('#STA').prop("checked", false);
		$("#ssid").val(changedSettings.apSSID);
		$("#password").val(changedSettings.apPassword);
		$("#apChannel").val(changedSettings.apChannel);
		$("#apChannel").trigger('change');
		$("#ipAddress").val(changedSettings.apIP);
	}
	
}

async function refreshFormLayout(){
	if($("#STA").is(':checked')){
		$("#rowAPChannel").hide();
		$("#rowMode").show();
		if($("#dhcp").is(':checked')){
			$("#rowIPAddress").hide();
			$("#rowNetmask").hide();
			$("#rowGateway").hide();
		}else if($("#static").is(':checked')){
			$("#rowIPAddress").show();
			$("#rowNetmask").show();
			$("#rowGateway").show();	
		}
	}else if($("#AP").is(':checked')){
		$("#rowAPChannel").show();
		$("#rowIPAddress").show();
		$("#rowMode").hide();
		$("#rowNetmask").hide();
		$("#rowGateway").hide();	
	}
		
}

async function storeSettings(){
	
	console.log("Updating settings in firmware.");
	
	if(changedSettings.radioMode == "STA"){

		await Promise.race([ port.send("$Radio/Mode=STA"), timeout(500) ]);
		await Promise.race([ port.send("$Sta/SSID=" + changedSettings.wifiSSID), timeout(500) ]);
				
		if(changedSettings.wifiPassword != currentSettings.wifiPassword){
			await Promise.race([ port.send("$Sta/Password=" + changedSettings.wifiPassword), timeout(500) ]);
		}
	
		if(changedSettings.wifiIPMode == "DHCP"){
			await Promise.race([ port.send("$Sta/IPMode=" + changedSettings.wifiIPMode), timeout(500) ]);
		}else if(changedSettings.wifiIPMode == "Static"){
			await Promise.race([ port.send("$Sta/IPMode=" + changedSettings.wifiIPMode), timeout(500) ]);
			await Promise.race([ port.send("$Sta/Gateway=" + changedSettings.wifiGateway), timeout(500) ]);
			await Promise.race([ port.send("$Sta/Netmask=" + changedSettings.wifiNetmask), timeout(500) ]);
			await Promise.race([ port.send("$Sta/IP=" + changedSettings.wifiIP), timeout(500) ]);
		}
		
	}else if(changedSettings.radioMode == "AP"){
		
		await Promise.race([ port.send("$Radio/Mode=AP"), timeout(500) ]);
		await Promise.race([ port.send("$AP/SSID=" + changedSettings.apSSID), timeout(500) ]);
		
		if(changedSettings.apPassword != currentSettings.apPassword){
			await Promise.race([ port.send("$AP/Password=" + changedSettings.apPassword), timeout(500) ]);
		}
		
		await Promise.race([ port.send("$AP/IP=" + changedSettings.apIP), timeout(500) ]);
		await Promise.race([ port.send("$AP/Channel=" + changedSettings.apChannel), timeout(500) ]);
		
	}
	
	changedSettings = null;
	currentSettings = null;
	await refreshSerialData();
	
}

async function updateForm(){

	//Display the update button	
	$("#update").show();	
	
	if($("#STA").is(':checked') && changedSettings.radioMode == 'AP'){
		//switch occurred
		changedSettings.radioMode = "STA";
		
		changedSettings.apSSID = $('#ssid').val();
		
		if(currentSettings.apPassword !== $('#password').val()){
			changedSettings.apPassword = $('#password').val();
		}
		
		changedSettings.apIP = $('#ipAddress').val();
		changedSettings.apChannel = $('#apChannel').val();
		
		//Load STA data
		await updateFormData()
		
	}else if($("#AP").is(':checked') && changedSettings.radioMode == 'STA'){
		
		changedSettings.radioMode = "AP";
		changedSettings.wifiSSID = $('#ssid').val();
		
		if(currentSettings.wifiPassword !== $('#password').val()){
			changedSettings.wifiPassword = $('#password').val();
		}
		
		if($("#dhcp").is(':checked')){
			changedSettings.wifiIPMode = "DHCP";
		}else if($("#static").is(':checked')){
			changedSettings.wifiIPMode = "Static";
			changedSettings.wifiIP = $('#ipAddress').val();
			changedSettings.wifiGateway = $('#gateway').val();
			changedSettings.wifiNetmask = $('#netmask').val();
		}
		
		//Load AP data
		await updateFormData();
		
	}else if($("#STA").is(':checked')){
		
		changedSettings.radioMode = "STA";
		changedSettings.wifiSSID = $('#ssid').val();
		
		if(currentSettings.wifiPassword !== $('#password').val()){
			changedSettings.wifiPassword = $('#password').val();
		}
		
		if($("#dhcp").is(':checked')){
			changedSettings.wifiIPMode = "DHCP";
		}else if($("#static").is(':checked')){
			changedSettings.wifiIPMode = "Static";
			changedSettings.wifiIP = $('#ipAddress').val();
			changedSettings.wifiGateway = $('#gateway').val();
			changedSettings.wifiNetmask = $('#netmask').val();
		}
		
	}else if($("#AP").is(':checked')){
		changedSettings.radioMode = "AP";
		
		changedSettings.apSSID = $('#ssid').val();
		
		if(currentSettings.apPassword !== $('#password').val()){
			changedSettings.apPassword = $('#password').val();
		}
		
		changedSettings.apIP = $('#ipAddress').val();
		changedSettings.apChannel = $('#apChannel').val();
		
	}
	
	await refreshFormLayout();
}

async function connect(){
	
	console.log("Attempting to connect...");
	
    try {
        serialPort = await navigator.serial.requestPort();
    }
    catch (e) {
        console.log("Connection failed: " + e);
        return;
    }
	
	port = await serialConnect(serialPort);
	
	if(port){
		console.log("Connection successful.");	
	}
	
	 try {
       
	    const response = await Promise.race([ port.send('$'), timeout(2000) ]);
		if(response.includes("HLP")){
			console.log("Grbl_Esp32 Found. Ready.");
		}else{
			throw new Error("Grbl_Esp32 not found on target device.");
		}
		
	 } catch (error) {
        console.log("Unhandled error: " + error);
		await disconnect();
    }
	
}

async function disconnect(){
	console.log("Disconnecting...");
	
	try {
		await port.close();
	}
	catch {
	}
	
	serialPort = null;
	port = null;
	currentSettings = null;
	changedSettings = null;
	console.log("Disconnected.");
}

function timeout(ms) {
    return new Promise((resolve, reject) => {
        let id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error(`Timed out in ${ms}ms.`));
    }, ms)
  });
}

function isConnected(){
	if(port){
		return true;
	}
	return false;
}

const connectButton = document.getElementById("connect");

connectButton.addEventListener('click', () => {
	buttonClick();		
});

const updateButton = document.getElementById("update");

updateButton.addEventListener('click', () => {
	updateClick();		
});

$("#firmware_form").submit(function () {
	return false;
});

var form = document.querySelector('form');
form.addEventListener('change', function() {
    updateForm();
});

$('#apChannel').on('select2:select', function (e) {
	updateForm();
});

async function buttonClick() {
    
	if(isConnected()){
		disconnect();
		disableForms();

	}else{		
		try {
			await connect();
		
			if(isConnected()){
				await enableForms();
				await refreshSerialData();
				await updateFormData();
				await refreshFormLayout();
			}
		
		} catch(e) {
			console.error(e);
		}
		
	}
}

async function updateClick() {
	try {
	    await storeSettings();
		alert("Programming successful.");
	} catch(e) {
		onsole.error(e);
	}
}


navigator.serial.addEventListener('connect', e => {
  // Add |e.port| to the UI or automatically connect.
});

navigator.serial.addEventListener('disconnect', e => {
  // Remove |e.port| from the UI. If the device was open the
  // disconnection can also be observed as a stream error.
});