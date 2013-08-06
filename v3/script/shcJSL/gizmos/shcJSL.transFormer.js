/**
* TransFormer: Interactive Form Handler
* @author Tim Steele
*	
* @package shcJSL
* @require jQuery 1.7.2
* 
* @version [1.0: 2012-08-17]
* - Initial script release
*/

/**
 * TRANSfORMER, TRANSfORMER.transFormer
 * 
 * TransFormer object
 */
TRANSfORMER = $tf = {}
TRANSfORMER.blunder = function(element) {
	var error;			// (Object) new error message
	var goofs = [];	// (Array) contains goof object
	var methods;		// (Object) methods for errors
	
	function error(message) {
		return shcJSL.addChildren(shcJSL.createNewElement("p","error-message"),[shcJSL.createNewElement("span","error-pointer"),document.createTextNode(message)])
	}
	
	methods = {
		create: function(param) {
			var err = new error(this);
			if (($(param.parentNode).children(".error-message")).length < 1) {
				param.parentNode.insertBefore(err, param.nextSibling);
				$(param.parentNode).addClass("error");
			} else {
				param.parentNode.replaceChild(err, $(param.parentNode).children(".error-message").get(0));
			}
		},
		destroy: function(param) {
			var err = $(param.parentNode).children(".error-message");
			if (err.length > 0) {
				param.parentNode.removeChild($(err).get(0));
				$(param.parentNode).removeClass("error");
			}
		}
	}
	
	goofs.push(element);
	
	for (var action in methods)(
		function(n,m) {
			goofs[n] = function(x) {
				return goofs.map(m,x);
			}
		}(action, methods[action])
	)
	
	return goofs;
}
TRANSfORMER.transFormer = $TransFormer = function(form) {
	var blunders = [];	// (Array) Array of any outstanding blunders;
	var checkReqd;			// (Function) Checks the required fields
	var checkSN;				// (Function) Check the screen name
	var fields = [];		// (Array) Array of all the form fields
	var methods;				// (Function) Bind the validation methods to the fields
	var required = [];	// (Array) Array of required fields
	var transformer; 		// The form object
	this.verify;				// (Function) Verify that the form is valid for submission
	
	var self = this;
	transformer = form;
	valid = 0;

	methods = function(target) {
		if ($(target).attr("shc:gizmo:form") != undefined) {



			// Scoped private variables
			var options;	// Form options from shc:gizmo:form
			var fn = [];	// Functions to run for validation

            options = eval('(' + $(target).attr("shc:gizmo:form") + ')');

			// Add element to the list of required elements
			if (options.required && options.required == true) required[required.length] = target;

			// Check if the input has to follow a pattern
			if (options.pattern) {
				fn[fn.length] = function(options) {
					var pattern = new RegExp(options.pattern);
					if (target.value != '') {
						if (pattern.test(target.value.toString())) return true;
						else return false;
					}	// END if target.value != ''
				} // END fn function
			} // END pattern
			
			if (options.special) {
				switch(options.special) {
					case "screen-name":
						fn[fn.length] = checkSN;
						break;
				}
			}
			
			if (options.custom) {
				fn[fn.length] = function(options) {
					return options.custom(target);
				}
			}
			
			$(target).bind('blur', function(event) {
				var i; // counter
				for (i=0; i < fn.length; i++) {
					if (this.value != '') {
						if (!(fn[i](options, target))) {
							(options.message)? $tf.blunder(this).create(options.message):$tf.blunder(this).create("Error");
							blunders[blunders.length] = this;
							break;
						} // END if error
					}
				}	// END for fn.length;
				if (i >= fn.length || this.value == '') {
					$tf.blunder(this).destroy();
					blunders.remove(this);
				}					
			});
		}
	}
	
	fields = shcJSL.sequence(transformer.elements);
	fields.map(methods);

	function checkReqd() {
		var flag = true;	// Valid flag;
		for (var i=0; i < required.length; i++) {
			if (required[i].nodeName == "FIELDSET") {
				var group;	// Group of form elements;
				group = $(required[i]).find('[name="' + required[i].id + '"]');
				if (group.length > 0) {
					for (var j =0; j < group.length; j++) {
						if ($(group[j]).is(":checked")) break;
					}
					
					if (j >= group.length) {
						if (flag != false) flag = false;
						$tf.blunder(required[i]).create("This field is required.")
					}
				}
				
			}	// END IF !INPUT
			else {
				if (required[i].value == '') {
					if (flag != false) flag = false;
					$tf.blunder(required[i]).create("This field is required.")
				}	// END IF required value
			}	// END ELSE != Input
		}	// END FOR
		return flag;
	}
	
	/* SPECIAL CASES */
	
	function checkSN(options, target) {
		var valid;	// Is screen name valid;
		
		if (window['ajaxdata'] && window['ajaxdata']['ajaxurl']) {
			jQuery.ajax({
				async: false,
				dataType: 'html',
				data: {
					"screen_name": target.value,
					"action": "validate_screen_name"
				},
				type: "POST",
				url: window['ajaxdata']['ajaxurl']
			}).success(function(data, status, xhr) {
				if (data == "true"){ 
					blunders.remove(this);
					valid = true
				} else {
					blunders[blunders.length] = this;
					valid = false;
				}
			}).error(function(xhr, status, message) {
				blunders.remove(this);
				valid = true;
			})
		}
		return valid;
	}
	
	this.verify = function() {
		var valid;
		
		valid = checkReqd();
		return valid;
	}
}

shcJSL.methods.transFormer = function(target, options) {
	var checkForLogin; 			// (Function) Check to see if the user is logged in
	var form;								// The form HTMLObject
	var figs; 							// Configurations for the current form
	var submitEval = {}; 		// Functions to run for testing the form submitting
	var transformers = [];	// (Array) Array of all the forms that are being monitored by transFormer

	form = target;
	
	submitEval[form.id] = [];
	
	// PRIVATE TEST METHODS
	checkForLogin = function() {
		if (window['OID'] != undefined) {
			var data = shcJSL.formDataToJSON(form);
			(form.id)? shcJSL.cookies("form-data").bake({value: '{"' + form.id + '":' + data + '}'}):shcJSL.cookies("form-data").bake({value:data});
			shcJSL.get(document).moodle({width:480, target:ajaxdata.ajaxurl, type:'POST', data:{action: 'get_template_ajax', template: 'page-login'}});
			return false;
		}
		else return true;
	}

	transformers[form.id] = new $TransFormer(form);
	submitEval[form.id][submitEval[form.id].length] = transformers[form.id].verify;

	figs = ($(form).attr("shc:gizmo:options") != undefined)? (((eval('(' + $(form).attr("shc:gizmo:options") + ')')).form)?(eval('(' + $(form).attr("shc:gizmo:options") + ')')).form:{}):{};
	
	if (figs.requireLogIn === true) {
		submitEval[form.id][submitEval[form.id].length] = checkForLogin;
	}
		
	$(target).bind('submit',function(event) {
		var success; // Whether success passes the check
		if (submitEval[this.id].length > 0) {
			var i = 0;
			do {
				success = submitEval[this.id][i]();
				i++;

			} while (success != false && i < submitEval[this.id].length)
		}
		
		if (success === false) event.preventDefault();
		else return true;
	})
	
}

shcJSL.gizmos.bulletin['shcJSL.transFormer.js'] = true;

/**
	 * Event Assigner
	 * 
	 * @access Public
	 * @author Tim Steele
	 * @since 1.0
	 */
if (shcJSL && shcJSL.gizmos)  {
	shcJSL.gizmos.transFormer = function(element) {
		shcJSL.get(element).transFormer();
	}
}
