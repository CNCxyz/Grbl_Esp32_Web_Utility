# Grbl_Esp32_Web_Utility (GEWU)

The GEWU is a easy to use graphical user interface for Grbl_Esp32 that works entirely on your web browser.

The utility allows you to make quick changes to the settings in order to get your Esp32 connected to your network as easily as possible by making changes via the serial port. This is perfect for the intial setup once your firmware has been installed. Once connected to the network, additional settings may be changed through the WebUI.

Current supported settings:

 * Wi-Fi / Access Point Mode
 * SSID & Password
 * Static or DHCP
 * IP Address
 * Access Point Channel
 * Gateway & Netmask
 
This project can be run in your web browser by visiting the following page: https://cncxyz.github.io/Grbl_Esp32_Web_Utility/
 
## How to Run
 
The Grbl_Esp32_Web_Utility requres a modern web browser that is capable of communicating using the [Web Serial API](https://wicg.github.io/serial/).
 
Supported Browers:
 
  * Edge (Version 79+)
  * Chrome & Chromium (Version 78+)
  * Opera (Version 65+)
  
On some browsers you must enable your browser's Expiremental Web Platform Features:

*chrome://flags/#enable-experimental-web-platform-features*

*opera://flags/#enable-experimental-web-platform-features*

*edge://flags/#enable-experimental-web-platform-features*

Note: Newer browsers have the compatability enabled by default. Due to the [Mozilla Foundation's stance on Web Serial](https://github.com/mozilla/standards-positions/issues/336), they do not offer support for this feature in Firefox.

The files can be downloaded and run on your personal machine, or run directly in your browser through the following page: https://cncxyz.github.io/Grbl_Esp32_Web_Utility/ 
