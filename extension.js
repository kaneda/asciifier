  /************************************************************************************
  This is your Page Code. The appAPI.ready() code block will be executed on every page load.
  For more information please visit our docs site: http://docs.crossrider.com
*************************************************************************************/

appAPI.ready(function($) {
  if ( !appAPI.isMatchPages("*.asciifierapp.com/*", "asciifierapp.com/*") ) { return; }
  var asciiDict = null;
  appAPI.db.async.get('ascii_dict', function(value) {
        if(value === null || value === undefined || Object.keys(value).length === 0) {
      $("#info").html("You don't have any ASCII art, right click any image, select 'ASCII It!', and then refresh this page");
      return;
    } else {
      asciiDict = value;
      $("#info").html("You have "+Object.keys(asciiDict).length+" ASCII images");
    }
    
    for(var id in asciiDict) {
      $("<div id='"+id+"' class='ascii_art'><div class='del_art'>X</div>"+asciiDict[id]+"</div>").appendTo($("#ascii_section"));
    }
    
    $(".ascii_art").live('mouseover', function(e) {
      $(e.currentTarget).find(".del_art").css('display','block');
    });
    
    $(".ascii_art").live('mouseleave', function(e) {
      $(e.currentTarget).find(".del_art").css('display','none');
    });
    
    $(".del_art").live('click', function(e) {
      var p = $($(e.currentTarget).parent());
      delete asciiDict[parseInt(p.attr('id'),10)];
      p.remove();
      appAPI.db.async.set('ascii_dict',asciiDict, appAPI.time.yearsFromNow(10));
    });
    });
});

