/**
* OpenID
* @author Tim Steele
*	
* @package Machina
* @require jQuery 1.7.2
* 
* @version 1.0 [2012-08-08]
* - Initial script release
* @version 2.0 [2013-06-17]
* - Modified to work with Machina 1.0 by Matt Strick
*/

 (function( Machina ) {
	var OpenID = Machina.Gizmos.openID = function(gizmos) {
 		/* TODO: Write the init function */
		return OpenID.fn.init(gizmos);		
 	};

 	OpenID.fn = OpenID.prototype = {
		configs:undefined,	// Configurations for openID
		element:undefined,	// Element for openID
		getOptions:undefined, // (Function) Get optional parameters for the service
		options:undefined,	// Element options for openID
		services:undefined,	// OpenID service URLs
				
		
		/* TODO: Taken from the Moodle2 prototype. Needs to be updated. */
		init: function(gizmos) {						
			/*
				For each OpenID gizmo find the options and generate
				necessary links to the right services			
			*/
			
			var l = gizmos.length,
				i = parseInt(l-1);
			do {
				// Retrieve list of services from options
				this.element = gizmos[i];
				options = JSON.parse("{" + gizmos[i].getAttribute("m:gizmo:options") + "}");
				
				// End if there are no options
				if (options.openID.length === 0) { 
					console.log("OpenID - No options specified");
					break; 
				} else {
					this.options = options.openID;
				}
					
				// Initialize the view
				OpenID.fn.view(this.element,options.openID.services);
				
				// Initialize the model
				OpenID.fn.model();
				
				// Initialize the controller
				OpenID.fn.controller(this.element);
				
			} while(i--);
			
 		},
 		model: function() {
			// TODO: needs to be exposed
			this.configs = {
				tokenURL: (window['OID'] != undefined && window['OID'].token_url != undefined)? window['OID'].token_url:'',
				//ssoURL: 'https://sears-qa.rpxnow.com' //QA
				ssoURL: 'https://signin.shld.net' //Prod
			};
		
			// TODO: needs to be exposed
			this.services = {
				facebook: {	// Needs ? for tokenURL
					url: '/facebook/connect_start',
					options: ["publish_stream","offline_access","user_activities","friends_activities","user_birthday","friends_birthday","user_events","friends_events","user_interests","friends_interests","user_likes","friends_likes","email","user_location","friends_location","user_hometown","friends_hometown"]
				}, // END facebook
				yahoo: {	// Needs & for tokenURL
					url: '/openid/start?openid_identifier=http://me.yahoo.com'
				}, // END Yahoo!
				google: {	// Neds & for tokenURL
					url: '/openid/start?openid_identifier=https://www.google.com/accounts/o8/id'
				}, // END Google
				twitter: {	// Needs ? for tokenURL
					url: '/twitter/start'
				}
			};			
			
			getConfigs = function() {
				return configs;
			};
			
			getServices = function() {
				return services;
			};
			
			return {
				getConfigs:getConfigs,
				getServices:getServices
			};
		},
 		view: function(element, options) {
			
			var m = Machina,
				dom = m.DOM,
				// Creating container elements
				container = dom.create("section","open-id",{"id":"login-open-id"}),
					span = dom.create("span","or"),
						span_text = document.createTextNode("OR"),
					p = dom.create("p"),
						p_text = document.createTextNode("use your account from"),				
					ul = dom.create("ul","open-id-services clearfix");	
				
				// Adding container elements to DOM
				element.appendChild(container);
					container.appendChild(span);
						span.appendChild(span_text);
					container.appendChild(p);
						p.appendChild(p_text);
					container.appendChild(ul);
				
			// Create and attach services	
			var service,
				service_a,
				service_name;
				
			for (i=0;i < options.length; i++) {	
				/*
					-build the DOM elements for each service
					-attach each set of elements to the DOM
					-attach click events to elements
				*/
				// build the DOM elements for each service
				service = dom.create("li","open-id_service open-id_"+options[i]),
					service_a = dom.create("a",null,{"shc:openid":options[i],"href":"#"}),
						service_name = document.createTextNode(options[i]),
				
				//attach each set of elements to the DOM
				ul.appendChild(service);
					service.appendChild(service_a);
						service_a.appendChild(service_name);
			}
			
			/* TODO: Write the view function */
			return true;
		}
 	};

 	OpenID.fn.controller = Machina.methods.openID = function(element) {
		var service; // Service the user is using for open ID
		var url; // Pop up URL
		var model;
		var configs;
		
		// TODO: remove jQuery req
		options = element.querySelectorAll("*[shc\\:openid]");
		model = OpenID.fn.model();
			configs = model.getConfigs();
			configs = model.getConfigs();
		
		url = configs.ssoURL + services[service].url;
		if (configs.tokenURL != '')(url.indexOf("?") == -1)? url = url + "?token_url=" + escape(configs.tokenURL):url = url + "&token_url=" + escape(configs.tokenURL);
		if (services[service].options) url = url + "&ext-perm=" + services[service].options.join();

		// TODO: remove jQuery req
		/* Click even for SSO Links
		$(value).bind('click',function() {
			var height; // New window height
			var width; // New window width
			
			height = 600;
			width = 600;
			mywindow = window.open(url, 'Login', 'resizable=0,height=' + height + ',width=' + width + ',left=' + ((screen.width/2) - (width/2)) + ',top=' + ((screen.height/2) - (height-2)))
		});	
		*/
		
		/* TODO: Write the controller function */
		return true;
 	};
	
 })( Machina );