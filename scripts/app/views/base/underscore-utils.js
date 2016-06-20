require(["underscore"], function(_){
	_.mixin({
	  sortWithSpecialChars: function(collection, property){
		  var charMapL = " 0123456789aábcdeéfghiíjklmnoóöőpqrstuúüűvwxyz";
		  var charsOrder = {};
		  for(var i in charMapL.split('')) {
		      charsOrder[charMapL[i]] = parseInt(i);
		  }

		  function mySort(model1, model2) {
		      var idx = 0;
		      s1 = model1.attributes[property];
		      s2 = model2.attributes[property];
		      while ( (idx < s1.length) && (idx <s2.length) && (charsOrder[s1[idx]] == charsOrder[s2[idx]])) {
		          idx ++;
		      }
		      if ((idx == s1.length) && (idx == s2.length)) return 0;
		      if (idx == s1.length) return 1;
		      if (idx == s2.length) return -1;
		      return charsOrder[s1[idx]] < charsOrder[s2[idx]] ? 1 : (charsOrder[s1[idx]] > charsOrder[s2[idx]] ? -1 : 0);
		  }
		  
		  return collection.sort(mySort);
	  }
	});
});