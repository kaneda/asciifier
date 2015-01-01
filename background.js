/*
 * Usage:
 *   Runs in the browser's background.
 *
 * Reference:
 *   http://docs.crossrider.com/#!/api/appAPI.contextMenu
 */
appAPI.contextMenu.add("key1", "ASCII It!", function (data) {
  var img = new Image();
  img.src = data.srcUrl;
  
  // Create an empty canvas element
    var canvas = document.createElement("canvas");
    var canvascheck=(canvas.getContext)? true : false; //check if object supports getContext() method, a method of the canvas element
  //alert(canvascheck); //alerts true if browser supports canvas element
  if(!canvascheck) {
    alert("Your browser doesn't support HTML5, please update your browser");
    return;
  }
  canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    
    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  if(!imgData || img.width === 0  || img.height === 0) {
    alert("You must choose a valid image (from the domain you're on!)");
    return;
  }

  var colArray = [[0,0,0,'&nbsp;'],[100.0,0,0,'/']];
  var numColors = 2;

  var chars = ['1','+','9','$','Y','#','@','%','=','0','2','A','8','?','!','&','4','6','^','€','•','¢','£','©','µ','¶','þ','3','7','\\','>','"'];

  var miminumDifference = 40;

  var asciiDict = appAPI.db.get('ascii_dict');
  var nextFreeId = appAPI.db.get('next_id');
  if(nextFreeId === null || nextFreeId === undefined) { nextFreeId = 0; }
  if(asciiDict === null || asciiDict === undefined) { asciiDict = {}; }
  
  var imgArray = new Array(canvas.height);
  for(var i = 0; i < img.height; i++) {
    imgArray[i] = new Array(canvas.width);
  }
  // first process the image into a 2D array so that josh can visualize this
  var row = 0;
  var column = 0;
  
  //Shuffle the image array first!
  var len = imgData.data.length;
  
  // Now make it into 2D
  for(i = 0; i < len; i+=4){
    imgArray[row][column] = [imgData.data[i+0],imgData.data[i+1],imgData.data[i+2]];
    // if we've gone through 
    if((column+1)%canvas.width === 0) {
      row++;
      column = 0;
    } else {
      column++;
    }
  }
  
  var text = "";
  
  /*
  * This whole opening section is in the assumption that the
  * upper-left-hand pixels of the image represent a background,
  * so that ones like it (within 12 units) will be '/'
  */
  var first_r = (imgArray[0][0][0]+imgArray[1][0][0]) / 512.0; // 255 * 2 * 1
  var first_g = (imgArray[0][0][1]+imgArray[1][0][1]) / 512.0;
  var first_b = (imgArray[0][0][2]+imgArray[1][0][2]) / 512.0;

  if(first_r > 0.04045) { first_r = Math.pow((first_r+0.055) / 1.055, 3); }
  else { first_r = first_r / 12.92; }
  
  if(first_g > 0.04045) { first_g = Math.pow((first_g+0.055) / 1.055, 3); }
  else { first_g = first_g / 12.92; }
  
  if(first_b > 0.04045) { first_b = Math.pow((first_b+0.055) / 1.055, 3); }
  else { first_b = first_b / 12.92; }
  
  first_r *= 100;
  first_g *= 100;
  first_b *= 100;
  
  var ref_x = 95.047;
  var ref_y = 100.0;
  var ref_z = 108.883;

  var first_x = (first_r * 0.4124 + first_g * 0.3576 + first_b * 0.1804) / ref_x;
  var first_y = (first_r * 0.2127 + first_g * 0.7152 + first_b * 0.0722) / ref_y;
  var first_z = (first_r * 0.0193 + first_g * 0.1192 + first_b * 0.9505) / ref_z;

  // Try sqrt if this doesnt work
  if ( first_x > 0.008856 ) { first_x = Math.pow(first_x, 0.5); }
  else { first_x = (7.787*first_x) + 0.13793; }
  
  if ( first_y > 0.008856 ) { first_y = Math.pow(first_y, 0.5); }
  else { first_y = (7.787*first_y) + 0.13793; }
  
  if ( first_z > 0.008856 ) { first_z = Math.pow(first_z, 0.5); }
  else { first_z = (7.787*first_z) + 0.13793; }
  
  // from 500 and 200 to 450 and 150 respectively
  var first_lab = [(116*first_y) - 16, 500 * (first_x - first_y), 200 * (first_y - first_z)]; // L a b
  
  var currentCharPos = 0;
  
  for(i = 0; i+4 < canvas.height; i+=4) {
    var nextI = [i+1,i+2,i+3];
    for(var j = 0; j+2 < canvas.width; j+=2) {
      var nextJ = j+1;
      var r_norm = (imgArray[i][j][0]+imgArray[nextI[0]][j][0]+imgArray[nextI[1]][j][0]+imgArray[nextI[2]][j][0]+imgArray[i][nextJ][0]+imgArray[nextI[0]][nextJ][0]+imgArray[nextI[1]][nextJ][0]+imgArray[nextI[2]][nextJ][0]) / 2040.0; // 255 * 4 * 2
      var g_norm = (imgArray[i][j][1]+imgArray[nextI[0]][j][1]+imgArray[nextI[1]][j][1]+imgArray[nextI[2]][j][1]+imgArray[i][nextJ][1]+imgArray[nextI[0]][nextJ][1]+imgArray[nextI[1]][nextJ][1]+imgArray[nextI[2]][nextJ][1]) / 2040.0; // 255 * 4 * 2
      var b_norm = (imgArray[i][j][2]+imgArray[nextI[0]][j][2]+imgArray[nextI[1]][j][2]+imgArray[nextI[2]][j][2]+imgArray[i][nextJ][2]+imgArray[nextI[0]][nextJ][2]+imgArray[nextI[1]][nextJ][2]+imgArray[nextI[2]][nextJ][2]) / 2040.0; // 255 * 4 * 2

      //var r_norm = imgArray[i][j][0] / 255.0; // 255
      //var g_norm = imgArray[i][j][1] / 255.0; // 255
      //var b_norm = imgArray[i][j][2] / 255.0; // 255
      
      if(r_norm > 0.04045) { x = (r_norm+0.055) / 1.055; r_norm = x*x*x*100; }
      else { r_norm *= 7.739938; }
      
      if(g_norm > 0.04045) { x = (g_norm+0.055) / 1.055; g_norm = x*x*x*100; }
      else { g_norm *= 7.739938; }
      
      if(b_norm > 0.04045) { x = (b_norm+0.055) / 1.055; b_norm = x*x*x*100; }
      else { b_norm *= 7.739938; }
      
      /* M for sRGB w/ D65, got this from that nifty site w/ the calculators
      0.4124564  0.3575761  0.1804375
      0.2126729  0.7151522  0.0721750
      0.0193339  0.1191920  0.9503041
      */
      
      var x = (r_norm * 0.4124 + g_norm * 0.3576 + b_norm * 0.1804) / ref_x;
      var y = (r_norm * 0.2127 + g_norm * 0.7152 + b_norm * 0.0722) / ref_y;
      var z = (r_norm * 0.0193 + g_norm * 0.1192 + b_norm * 0.9505) / ref_z;
      
      // Sqrt here instead of cubert works just as well
      if ( x > 0.008856 ) { x = Math.sqrt(x); }
      else { x = (7.787 * x) + 0.13793; }
      
      if ( y > 0.008856 ) { y = Math.sqrt(y); }
      else { y = (7.787 * y) + 0.13793; }
      
      if ( z > 0.008856 ) { z = Math.sqrt(z); }
      else { z = (7.787 * z) + 0.13793; }
      
      var l = (116 * y) - 16;
      var a = 500 * (x - y);
      var b = 500 * (y - z);
        
      //Abs val instead of euclidean distance
      var delF = Math.abs(l-first_lab[0])+(Math.abs(a-first_lab[1])+Math.abs(b-first_lab[2]))/2;
      if(delF < 12) {
        selectedChar = '&nbsp;';
      } else {
        var high = numColors;
        var low = 0;
        
        var leastDiff = 9999;
        var leastIndex = high-1;
        
        // Make a stack, roll out the binary search for our least delta
        var colorIndexStack = new Array();
        colorIndexStack.push([low,high]);
        while(colorIndexStack.length > 0) {
          var stackObj = colorIndexStack.pop();
          var split = Math.floor((stackObj[0]+stackObj[1])/2);
          if(split < 0 || split >= high) { continue; }
          var delE = Math.abs(l-colArray[split][0])+(Math.abs(a-colArray[split][1])+Math.abs(b-colArray[split][2]))/2;
          if(delE < leastDiff) {
            leastDiff = delE;
            leastIndex = split;
            colorIndexStack.push([split,stackObj[1]]);
            colorIndexStack.push([stackObj[0],split+1]);
          }
        }
        
        // If the color difference is great enough add it as a color to recognize as unique
        if(leastDiff > miminumDifference) {
          if(colArray[leastIndex][0] > l || (colArray[leastIndex][0] == l && (colArray[leastIndex][1] > a || (colArray[leastIndex][1] == a && colArray[leastIndex][2] > b)))) {
            colArray.splice(leastIndex,0,[l,a,b,chars[currentCharPos++]]);
          } else {
            leastIndex++;
            colArray.splice(leastIndex,0,[l,a,b,chars[currentCharPos++]]);
          }
          numColors++;
          currentCharPos = currentCharPos%32;
          miminumDifference = miminumDifference + 5;
          //if(minimumDifference > 125) { minimumDifference = 125; } // TODO
        }
        selectedChar = colArray[leastIndex][3];
      }
      text += selectedChar;
    }
    text += "<br>";
  }

  asciiDict[nextFreeId] = text;
  appAPI.db.set('ascii_dict',asciiDict);
  appAPI.db.set('next_id',nextFreeId+1);
  alert("Go to www.asciifierapp.com to see your art!");
}, ["image"]);

