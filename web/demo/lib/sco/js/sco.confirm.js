/* ==========================================================
 * sco.confirm.js
 * http://github.com/terebentina/sco.js
 * ==========================================================
 * Copyright 2013 Dan Caragea.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

/*jshint laxcomma:true, sub:true, browser:true, jquery:true, devel:true */

;(function($, undefined) {
	"use strict";

	var pluginName = 'scojs_confirm';

	function Confirm(options) {
		this.options = $.extend({}, $.fn[pluginName].defaults, options);
		this.$modal = $(this.options.target).attr('class', 'modal fade').hide();
		var self = this;

		function init() {
			if (self.options.title === '') {
				self.options.title = '&nbsp;';
			}
		};

		init();
	}


	$.extend(Confirm.prototype, {
		show: function(action) {
			var self = this
				,$backdrop;

			if (!this.options.nobackdrop) {
				$backdrop = $('.modal-backdrop');
			}
			if (!this.$modal.length) {
				this.$modal = $('<div class="modal fade" id="' + this.options.target.substr(1) + '"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title"></h4></div><div class="modal-body" style="max-height:400px;overflow :auto;"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">取消</button><button type="button" class="btn btn-primary btn-green" data-submit="1">提交</button></div></div></div></div>').appendTo(this.options.appendTo).hide();
			}
			if (typeof this.options.submit == 'function') {
				var self = this;
				this.$modal.find('[data-submit]').unbind('click');
				this.$modal.find('[data-submit]').on('click.' + pluginName, function(e) {
					e.preventDefault();
					if(self.options.submit.call(self))
					{
						self.close();
					};
				});
			} else if (typeof this.options.submit == 'string') {
				alert('submit ' + this.options.submit + ' is not a function!');
			}

			if (typeof this.options.cancel == 'function') {
				var self = this;
				this.$modal.find('[data-dismiss]').unbind('click');
				this.$modal.find('[data-dismiss]').on('click.' + pluginName, function(e) {
					e.preventDefault();
					self.options.cancel.call(self);
					self.close();
				});
			} else if (typeof this.options.cancel == 'string') {
				alert('cancel ' + this.options.cancel + ' is not a function!');
			}

			this.$modal.find('.modal-title').html(this.options.title);
			if(typeof this.options.cancelText == 'string')
				this.$modal.find('.btn-default').html(this.options.cancelText);
			if(typeof this.options.submitText == 'string')
				this.$modal.find('.btn-primary').text(this.options.submitText);

			if (this.options.cssclass !== undefined) {
				this.$modal.attr('class', 'modal fade ' + this.options.cssclass);
			}

			if (this.options.width !== undefined) {
				this.$modal.find('.modal-dialog').css({'width': this.options.width});
			}

			if (this.options.left !== undefined) {
				this.$modal.find('.modal-content').css({'left': this.options.left});
			}

			if (this.options.height !== undefined) {
				this.$modal.find('.modal-content').css({'height': this.options.height});
			}

			if (this.options.top !== undefined) {
				this.$modal.find('.modal-content').css({'top': this.options.top});
			}

			if (this.options.keyboard) {
				this.escape();
			}

			if (!this.options.nobackdrop) {
				if (!$backdrop.length) {
					$backdrop = $('<div class="modal-backdrop fade" />').appendTo(this.options.appendTo);
				}
				$backdrop[0].offsetWidth; // force reflow
				$backdrop.addClass('in');
			}

			this.$modal.off('close.' + pluginName).on('close.' + pluginName, function() {
				self.close.call(self);
			});
			if (this.options.remote !== undefined && this.options.remote != '' && this.options.remote !== '#') {
				var spinner;
				if (typeof Spinner == 'function') {
					spinner = new Spinner({color: '#3d9bce'}).spin(this.$modal[0]);
				}
				this.$modal.find('.modal-body').load(this.options.remote, function() {
					if (spinner) {
						spinner.stop();
					}
					if (self.options.cache) {
						self.options.content = $(this).html();
						delete self.options.remote;
					}
				});
			} else {
				this.$modal.find('.modal-body').html(this.options.content);
			}

			this.$modal.show().addClass('in');

			/*模态框显示后执行*/
			if(typeof action == 'function') {
				action();
			}

			return this;
		}

		,close: function() {
			this.$modal.hide().off('.' + pluginName).find('.modal-body').html('');
			if (this.options.cssclass !== undefined) {
				this.$modal.removeClass(this.options.cssclass);
			}
			$(document).off('keyup.' + pluginName);
			$('.modal-backdrop').remove();
			if (typeof this.options.onClose === 'function') {
				this.options.onClose.call(this, this.options);
			}
			return this;
		}

		,destroy: function() {
			this.$modal.remove();
			$(document).off('keyup.' + pluginName);
			$('.modal-backdrop').remove();
			this.$modal = null;
			return this;
		}

		,escape: function() {
			var self = this;
			$(document).on('keyup.' + pluginName, function(e) {
				if (e.which == 27) {
					self.close();
				}
			});
		}
	});


	$.fn[pluginName] = function(options) {
		return this.each(function() {
			var obj;
			if (!(obj = $.data(this, pluginName))) {
				var $this = $(this)
					,data = $this.data()
					,title = $this.attr('title') || data.title
					,opts = $.extend({}, $.fn[pluginName].defaults, options, data)
					;
				if (!title) {
					title = 'this';
				}
				opts.content = opts.content.replace(':title', title);
				if (typeof window[opts.submit] == 'function') {
					opts.submit = window[opts.submit];
				}
				if (typeof window[opts.cancel] == 'function') {
					opts.cancel = window[opts.cancel];
				}
				obj = new Confirm(opts);
				$.data(this, pluginName, obj);
			}
			obj.show();
		});
	};

	$[pluginName] = function(options) {
		return new Confirm(options);
	};


	$.fn[pluginName].defaults = {
		title: '&nbsp;'		// modal title
		,target: '#confirm_modal'	// the modal id. MUST be an id for now.
		,content: ''		// the static modal content (in case it's not loaded via ajax)
		,appendTo: 'body'	// where should the modal be appended to (default to document.body). Added for unit tests, not really needed in real life.
		,cache: false		// should we cache the output of the ajax calls so that next time they're shown from cache?
		,keyboard: false
		,nobackdrop: false
	};


	$(document).on('click.' + pluginName, '[data-trigger="confirm"]', function() {
		$(this)[pluginName]();
		if ($(this).is('a')) {
			return false;
		}
	}).on('click.' + pluginName, '[data-dismiss="modal"]', function(e) {
		e.preventDefault();
		$(this).closest('.modal').trigger('close');
	});
})(jQuery);
