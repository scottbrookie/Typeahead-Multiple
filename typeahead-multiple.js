!function($) {
    'use strict';

    var TypeaheadMultiple = {
        select: function () {
            var val = this.$menu.find('.active').attr('data-value');
            var offset = val.length - this.length_of_query;
            var position = getCaretPosition(this.$element[0]) + offset;

            if (this.autoSelect || val) {
                this.$element
                    .val(this.updater(val))
                    .change();
            }

            setCaretPosition(this.$element[0], position);
            return this.hide();
        },
        updater: function(item) {
            var caretPos = getCaretPosition(this.$element[0]);
            // Is user typing at end of textbox?
            if (caretPos === this.query.length) {
                // User is typing at end of textbox, just append the item
                return this.$element.val().replace(/[^\W]*$/,'')+item;
            }
            else {
                // Find and remove user's input, then insert the item
                var queryBeforeCarat = this.query.substring(0, caretPos);
                var lastNonAlphanumeric = doLastNonAlphaNumericCharRegEx(queryBeforeCarat);
                var inputToReplace;
                if (lastNonAlphanumeric) {
                    inputToReplace = queryBeforeCarat.substring(lastNonAlphanumeric.index + 1);
                    var startPosOfUserInput = caretPos - inputToReplace.length;
                    return this.query.substring(0, startPosOfUserInput) + item + this.query.substring(caretPos);
                }
                else {
                    // User was typing at beginning of box, just insert at beginning
                    return item + this.query.substring(caretPos);
                }
            }
        },
        matcher: function (item) {
            var usersCurrentQuery = '';
            var caretPos = getCaretPosition(this.$element[0]);
            // Is user typing at end of textbox?
            if (caretPos === this.query.length) {
                usersCurrentQuery = extractUserInputAtTextBoxEnd(this.query);
            }
            else {
                // The user's current input is between the caret and the last non-alphanumeric char before it
                var queryBeforeCarat = this.query.substring(0, caretPos);
                var lastNonAlphanumeric = doLastNonAlphaNumericCharRegEx(queryBeforeCarat);
                if (lastNonAlphanumeric) {
                    usersCurrentQuery = queryBeforeCarat.substring(lastNonAlphanumeric.index + 1);
                }
                else {
                    // If there are no non-alphanumerics before the carat, they started typing
                    // at the beginning of the textbox and we just evaluate up to the caret
                    usersCurrentQuery = queryBeforeCarat;
                }
            }
            if (!usersCurrentQuery) {
                return false;
            }
            this.length_of_query = usersCurrentQuery.length;
            return !item.toLowerCase().indexOf(usersCurrentQuery.toLowerCase());
        },
        highlighter: function (item) {
            var query = extractUserInputAtTextBoxEnd(this.query);
            query = query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
            return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                return '<strong>' + match + '</strong>';
            });
        }
    };

    function doLastNonAlphaNumericCharRegEx(query) {
        return (/\W(?!.*\W)/).exec(query);
    }

    function extractUserInputAtTextBoxEnd(query) {
        var result = /([^\W]+)$/.exec(query);
        if (result && result[1]) {
            return result[1].trim();
        }
        return '';
    }

    function getCaretPosition(element) {
        if (element.selectionStart) {
            return element.selectionStart;
        } else if (document.selection) {
            element.focus();

            var r = document.selection.createRange();
            if (r == null) {
                return 0;
            }

            var re = element.createTextRange(),
                rc = re.duplicate();
            re.moveToBookmark(r.getBookmark());
            rc.setEndPoint('EndToStart', re);

            return rc.text.length;
        }
        return 0;
    }

    function setCaretPosition(element, caretPos) {
        if (element != null) {
            if (element.createTextRange) {
                var range = element.createTextRange();
                range.move('character', caretPos);
                range.select();
            }
            else {
                if (element.selectionStart) {
                    element.focus();
                    element.setSelectionRange(caretPos, caretPos);
                }
                else {
                    element.focus();
                }
            }
        }
    }

    $.extend($.fn.typeahead.Constructor.prototype, TypeaheadMultiple);

}(window.jQuery);
