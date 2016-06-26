define(['handlebars'], function (Handlebars) {
 function if_eq (a, b, opts) {
	    if(a == b)
	        return opts.fn(this);
	    else
	        return opts.inverse(this);
 };
 function unless_eq (a, b, opts) {
     if (a == b) 
         return opts.inverse(this);
     else
         return opts.fn(this);
 };

 Handlebars.registerHelper('if_eq', if_eq);
 Handlebars.registerHelper('unless_eq', unless_eq);
});