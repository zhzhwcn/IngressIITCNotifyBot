// ==UserScript==
// @id             iitc-notify-bot
// @name           IITC plugin: notify-bot
// @category       Bot
// @version        0.1
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @description    Auto send message to the users.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @include        https://notify.ingress.party/*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @match          https://notify.ingress.party/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'zhzhwcn';
plugin_info.dateTimeVersion = '20150917.154202';
plugin_info.pluginId = 'notify-bot';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////


// use own namespace for plugin
window.plugin.notifyBot = function() {};

window.plugin.notifyBot.setup  = function() {
  console.log('notifyBot Setup');
  
  // disable idle
  window._idleTimeLimit = 60*60*24;
  
  var key = localStorage.getItem('_iitc_plugin_notify_bot_key');
  if(!key){
    $('#toolbox').append('<a onclick="window.plugin.notifyBot.displayKeyDlg()" title="Setup Bot Key" accesskey="t">NotifyBot</a>');
    return;
  }
  window.plugin.notifyBot.setKey(key);
  // add msg hook
  // it seems the public messages contains the faction messages
  // so we just need one hook
  addHook('publicChatDataAvailable',window.plugin.notifyBot.handleMsg)
  // addHook('factionChatDataAvailable',window.plugin.notifyBot.handleMsg)
};

var setup =  window.plugin.notifyBot.setup;
// set up the key
window.plugin.notifyBot._key = '';
window.plugin.notifyBot.setKey = function(key){
  window.plugin.notifyBot._key = key;
  localStorage.setItem('_iitc_plugin_notify_bot_key',key);
}
// window.plugin.notifyBot.handlePubMsg = function(data){}
// window.plugin.notifyBot.handleFacMsg = function(data){}

window.plugin.notifyBot.handleMsg = function(data){
  console.log('incoming msg:',data);
  var key = window.plugin.notifyBot.getKey();
  if(data.raw.result.length === 0){
      return;
  }
  $.get('https://notify.ingress.party/message/' + key, function(json){
    window.plugin.notifyBot._message = json;
    // window.plugin.notifyBot._message.sent = new Array();
    msgs = data.raw.result;
	var nicknames = new Array();
	
    for(var i = 0; i < msgs.length; i++){
      var nickname = '';
      if(!msgs[i][2] || !msgs[i][2].plext || msgs[i][2].plext.markup.length === 0){
        continue;
      }
      for(var j = 0; j < msgs[i][2].plext.markup.length; j++){
        if(msgs[i][2].plext.markup[j][0] == 'PLAYER' && msgs[i][2].plext.markup[j][1].team == 'RESISTANCE'){
          nickname = msgs[i][2].plext.markup[j][1].plain;
		}
      }
	  if(nickname === ''){
		console.log('Not a RES OR not an agent');
        continue;
	  }
	  //console.log('Got a RES agent:',nickname);
	  
	  if(nicknames.indexOf(nickname) !== -1){
		continue;
	  }
	  nicknames.push(nickname);
    }
	if(nicknames.length > 0){
	  console.log('Got Agents:',nicknames.join(','));
	}
	for(var i = 0; i < nicknames.length; i++){
      var nickname = nicknames[i];
	  // debugger;
	  $.get('https://notify.ingress.party/user/'+ nickname + '/' + key, function(user){
		var msgToSend = '';
		if(user.isNew && window.plugin.notifyBot._message.welcome !== ''){
		  msgToSend = '@'+user.nickname+' ' + window.plugin.notifyBot._message.welcome;
		  console.log('Ready To Send: ',msgToSend);
		  $('#chatinput input').val(msgToSend);
		  window.chat.postMsg();
		}
		if(window.plugin.notifyBot._message.event !== '' && Date.parse(window.plugin.notifyBot._message.eventDate) > Date.now() && !user.sent){
		  msgToSend = '@'+user.nickname+' ' + window.plugin.notifyBot._message.event;
		  console.log('Ready To Send: ',msgToSend);
		  $('#chatinput input').val(msgToSend);
		  window.chat.postMsg();
		  $.get('https://notify.ingress.party/sent/'+ user.nickname + '/' + key);
		}
		
	  });
	}
	
	
	
  },'json');
};

window.plugin.notifyBot.getKey = function(){
  return window.plugin.notifyBot._key;
}

window.plugin.notifyBot.displayKeyDlg = function(){
  dialog({
    title:'Notify Bot Key',
    html:'<input placeholder="Input your key" value="' + window.plugin.notifyBot.getKey() + '">',
    buttons:{
      'OK':function() {
          var key = $(this).find('input').val();
          window.plugin.notifyBot.setKey(key);
          $(this).dialog('close');
          window.location.reload();
      }
    }
  });
};
// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
