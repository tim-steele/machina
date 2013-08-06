/**
* actions
* @author Sebastian Frohm
*
* @package shcJSL
* @require jQuery 1.7.2
*
* @version [1.0: 2012-08-08]
* - Initial script release
*/
var allActions = [];

var isVoteSwitch = false;

ACTIONS = {};
/**
 *
 * @type {Function}
 * @var element (Object) tooltip base element on page
 * @var options (Object) options regarding the construction of the tooltip
 */
ACTIONS.actions = $actions = function(element, options) {
    var _this = this;

    _this.action = {
        element: null
    };

    _this.options = {
        customEvent: null,
        customListener: null,
        element: null,
        post: {
            blocker: function() {
                return true;
            },
            id: 0,
            name: '',
            sub_type: '',
            type: '',
            nli_reset: ''
        },
        resetAction: true
    };

    _this.originalOptions = {};

    _this.originalAction = {};

    _this.click = function() {
        _this._postAction(_this.action.element, _this.options);
    };

    _this.init = function(element, options) {
        _this.setActionObject(element);

        /**
         * Take in options based in on creation and shove onto existing _this.options;
         */
        _this.originalOptions = _this.options = jQuery.extend(true, _this.options, options);
    };

    _this.setActionObject = function(element) {
        _this.originalAction.element = _this.action.element = element;
    };

    _this._postAction = function(element, options) {
        if(_this.options.post.blocker(element) == false) {
            return false;
        }

        var post = options.post;

        jQuery.post(
            ajaxurl + '?action=add_user_action',
            post,
            function(data) {
                data = eval(data);

                if(_this.options.resetAction === true) {
                    _this._decideForDownUpSwitch(data);
                }

                if(data === 'activated') {
                    jQuery(element).addClass('active');
                } else if(data === 'deactivated') {
                    jQuery(element).removeClass('active');
                } else if(data === 'activated-out') {
                    _this._updateCookie(data);

                    jQuery(element).addClass('active');
                } else if(data === 'deactivated-out') {
                    _this._updateCookie(data);

                    jQuery(element).removeClass('active');
                }

                if(typeof _this.options.customEvent === 'function') {
                    _this.options.customEvent(jQuery(element));
                }

                _this._resetActionTotal(data, element);
            }
        );
    };

    _this._decideForDownUpSwitch = function(data) {
        var newOptions = {};
        newOptions.actions = {};
        newOptions.actions.post = {
            id: 0,
            name: '',
            sub_type: '',
            type: '',
            nli_reset: ''
        };

        if(data === 'activated' || data === 'activated-out') {
            var thisAction = _this.options.post.name === 'downvote' ? 'upvote' : 'downvote';

            if(jQuery(_this.action.element).siblings('button[name=' + thisAction + ']').hasClass('active')) {
                /**
                 * Reset options for _this clicked button
                 */
                _this.options.post.nli_reset = 'deactivate';
                newOptions.actions.post = _this.options.post;

                jQuery(_this.action.element).attr('shc:gizmo:options', JSON.stringify(newOptions));

                var options = eval('(' + jQuery(_this.action.element).siblings('button[name=' + thisAction + ']').attr('shc:gizmo:options') + ')');

                /**
                 * Unset nli_reset (Not Logged In Reset of vote)
                 */
                options.actions.post.nli_reset = null;

                jQuery(_this.action.element).siblings('button[name=' + thisAction + ']').attr('shc:gizmo:options', JSON.stringify(options));

                options.actions.post.nli_reset = 'deactivate';

                _this._postAction(jQuery(_this.action.element).siblings('button[name=' + thisAction + ']'), options.actions);

                isVoteSwitch = true;
            } else {
                _this.options.post.nli_reset = 'deactivate';
                newOptions.actions.post = _this.options.post;

                jQuery(_this.action.element).attr('shc:gizmo:options', JSON.stringify(newOptions));

                isVoteSwitch = false;
            }
        } else {
            if(isVoteSwitch === false) {
                _this.options.post.nli_reset = null;

                newOptions.actions.post = _this.options.post;

                jQuery(_this.action.element).attr('shc:gizmo:options', JSON.stringify(newOptions));
            }

            isVoteSwitch = false;
        }
    };

    _this._resetActionTotal = function(data, element) {
        var action = _this.options.post.name;
        var currentTotal = '';

        if(action == 'follow') {
            var text = data === 'activated' ? 'following' : 'follow';

            jQuery(element).html(text);
        } else if(action == 'flag') {

        } else {
            var curId = jQuery(element).attr('id');
            var curValue = jQuery('label[for="' + curId + '"]').html();

            curValue = curValue.replace(/[^0-9]/g, '');

            if(data === 'activated' || data === 'activated-out') {
                currentTotal = parseInt(curValue) + 1;
            } else if(data === 'deactivated' || data === 'deactivated-out') {
                currentTotal = parseInt(curValue) - 1;
            }

            jQuery('label[for="' + curId + '"]').html("(" + currentTotal + ')');
        }
    };

    _this._updateCookie = function(data) {
        var addedToCookie = false;
        var currentCookie = {}
        var existingCookies = [];
        var jsonString = '{"actions": [';

        if(typeof(shcJSL.cookies('actions').serve('value')) !== 'undefined' && shcJSL.cookies('actions').serve('value') !== '') {
            existingCookies = eval('(' + shcJSL.cookies('actions').serve('value') + ')');
            existingCookies = existingCookies.actions;

            for(var i = 0; i < existingCookies.length; i++) {
                currentCookie = existingCookies[i];

                if(currentCookie.id != _this.options.post.id) {
                    jsonString += '{"id": "' + currentCookie.id +
                                        '", "name": "' + currentCookie.name +
                                        '", "sub_type": "' + currentCookie.sub_type +
                                        '", "type": "' + currentCookie.type + '"}, ';

                    addedToCookie = true;
                } else {
                    //The ids are the same; now it's time for work

                    /**
                     * The names are not the same; which means we are not deactivating
                     */
                    if(currentCookie.name != _this.options.post.name) {
                        /**
                         * Is the cookie an upvote? Is the current action a downvote? Turn off the upvote
                         */
                        if(currentCookie.name == 'upvote' && _this.options.post.name == 'downvote') {
                            continue;
                        } else if(currentCookie.name == 'downvote' && _this.options.post.name == 'upvote') {
                            continue;
                        } else {
                            jsonString += '{"id": "' + currentCookie.id +
                                                '", "name": "' + currentCookie.name +
                                                '", "sub_type": "' + currentCookie.sub_type +
                                                '", "type": "' + currentCookie.type + '"}, ';

                            addedToCookie = true;
                        }
                    }
                }
            }
        }

        if(data !== 'deactivated-out') {
            jsonString += '{"id": "' + _this.options.post.id + '", "name": "' + _this.options.post.name + '", "sub_type": "' + _this.options.post.sub_type + '", "type": "' + _this.options.post.type + '"}]}';
        } else if(addedToCookie === true) {
            jsonString = jsonString.substring(0, jsonString .length - 1) + "]}";
        }

        shcJSL.cookies("actions").bake({value: jsonString, expiration: '1y'});
    };

    _this.init(element, options);
};

shcJSL.gizmos.bulletin['shcJSL.actions.js'] = true;

/**
 * Controller -
 * @param target
 * @param options = this instance
 */
shcJSL.methods.actions = function(_element, options) {
    var _elementOptions = ($(_element).attr("shc:gizmo:options") != undefined)? (((eval('(' + $(_element).attr("shc:gizmo:options") + ')')).actions) ? (eval('(' + $(_element).attr("shc:gizmo:options") + ')')).actions:{}):{};

    var action = ($actions instanceof ACTIONS.actions) ? $actions : new $actions(jQuery(_element), _elementOptions);

    action.click();
};

/**
	 * Event Assigner
	 *
	 * Assigns the click event for moodle to the element
	 *
	 * @access Public
	 * @author Tim Steele
	 * @since 1.0
	 */
if (shcJSL && shcJSL.gizmos)  {
	shcJSL.gizmos.actions = function(element) {
		options = ($(element).attr("shc:gizmo:options") != undefined)? (((eval('(' + $(element).attr("shc:gizmo:options") + ')')).actions)?(eval('(' + $(element).attr("shc:gizmo:options") + ')')).actions:{}):{};

        jQuery(element).click(function() {
            shcJSL.get(element).actions(element, options);
        });
    }
}
