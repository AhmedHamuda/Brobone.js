define(['jquery'], function($){
	var validate = function(self, element){
		var validationAttrs = self.$(element).attr("data-validate");
		var validators = validationAttrs && validationAttrs.split(' ');
		var value = self.$(element).val();
		if (validators) {
		    for (var i = 0; i < validators.length; i++) {
		        switch (validators[i]) {
		            case "req":
		                if (!value || value == "" || value == null) {
		                    return { validation: validators[i], element: element };
		                }
		                break;
		            case "minlen":
		                var minLen = self.$(element).attr("data-min-len");
		                if (!minLen || !$.isNumeric(minLen)) {
		                    throw "element doesnt have data-min-len attribute or the attributes is not numeric";
		                }
		                if (value.length < parseInt(minLen)) {
		                    return { validation: validators[i], element: element };
		                }
		                break;
		            case "maxlen":
		                var maxLen = self.$(element).attr("data-max-len");
		                if (!self.$(maxLen) || !$.isNumeric(maxLen)) {
		                    throw "element doesnt have data-max-len attribute or the attributes is not numeric";
		                }
		                if (value.length > parseInt(maxLen)) {
		                    return { validation: validators[i], element: element };
		                }
		                break;
		            case "num":
		                if (!value.match(/^\d+$/)) {
		                    return { validation: validators[i], element: element };
		                }
		                break;
		            case "date":
		                try {
		                    Date.parse(value);
		                } catch (e) {
		                    return { validation: validators[i], element: element };
		                }
		                break;
		            case "datetoday":
		                try {
		                    var date = Date.parse(value);
		                    var today = new Date();
		                    today.setHours(0, 0, 0, 0);
		                    if (date > today) {
		                        return { validation: validators[i], element: element };
		                    }
		                } catch (e) {
		                    return { validation: validators[i], element: element };
		                }
		                break;
		            default:
		                break;
		        }
		    }
		}
		return false;
	}
	
	return {validate: validate};
})