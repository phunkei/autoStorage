/*!
 * jQuery autoStorage Plugin
 * Examples and documentation at: http://www.phunkei.de
 * Github: https://github.com/phunkei/autoStorage
 * Copyright 2014 Daniel Miguel Baltes Amado, Licensed under the Apache License, Version 2.0 http://www.apache.org/licenses/LICENSE-2.0
 * Version: 0.7
 */
(function( $ ){
	$.fn.autoStorage = function(settings) {
		var settings = settings;
		var data;
		var exclude;
		var submit;
		
		$(function() {
			if(settings['storageType'] == 'local') {
				data = localStorage;
			}
			else if(settings['storageType'] == 'session') {
				data = sessionStorage;
			}
			else {
				data = localStorage;
			}
			exclude = (settings['exclude'] !== undefined) ? settings['exclude'] : new Array();
			submit = (settings['submit'] !== undefined) ? settings['submit'] : true;
			if(data.getItem('autoStorage') !== undefined) {
				loadValues();
			}
		});

		this.children('input[type=submit]').click( function() {
			return submitForm($(this).parent('form'));
		});
		
		this.submit( function() {
			return submitForm($(this));
		});
		
		function submitForm(form) {
			console.log('SUBMIT');
			var formname = $(form).attr('name');
			var nodes = getValues($(form));
			
			var storage_str = data.getItem("autoStorage");
			if(storage_str !== undefined && storage_str != '' && storage_str != null) {
				var storage = jQuery.parseJSON(storage_str);
			}
			else {
				var storage = new Object();
			}
			storage[formname] = nodes;
			data.setItem('autoStorage', JSON.stringify(storage));	
			return submit;
		}

		function getValues(form) {
			var fname = $(form).attr('name');
			var nodes = new Object();
			
			$(form).find('input[type=text], input[type=email], input[type=search]').each( function () {
				if(hasValue($(this).attr('name'), exclude)) { return true; }
				var e = $(this).attr('name');
				nodes[e] = {'--type': $(this).attr('type'), 'value': $(this).val()};
			});
			
			$(form).find('input[type=checkbox]').each( function () {
				if(hasValue($(this).attr('name'), exclude)) { return true; }
				nodes[$(this).attr('name')] = { '--type': 'checkbox', 'is_checked': $(this).is(':checked') };
			});
			
			$(form).find('input[type=radio]').each( function () {
				if(hasValue($(this).attr('name'), exclude)) { return true; }
				if($(this).is(':checked')) {
					nodes[$(this).attr('name')] = { '--type': 'radio', 'value': $(this).val(),'is_checked': $(this).is(':checked') };
				}
			});
			
			$(form).find('select').each( function () {
				if(hasValue($(this).attr('name'), exclude)) { return true; }
				var sname = $(this).attr('name');
				$(this).children('option').each( function() {
					if(nodes[sname] === undefined) {
						nodes[sname] = new Object();
					}
					nodes[sname][$(this).val()] = $(this).is(':selected');
				});
				nodes[sname]['--type'] = 'select';
			});
			
			return nodes;
		}

		function loadValues() {
			var storage = jQuery.parseJSON(data.getItem("autoStorage"));
			jQuery.each(storage, function(formname, form) {
				jQuery.each(form, function(elementname, element) {
					var type = element['--type'];
					if(type == 'text' || type == 'email' || type == 'search') {
						$('form[name='+formname+']').find('input[name='+escapeName(elementname)+']').val(element['value']);
					}
					else if(type == 'checkbox') {
						if(element['is_checked']) {
							$('form[name='+formname+']').find('input[name='+escapeName(elementname)+']').attr('checked', 'checked');
						}
					}
					else if(type == 'radio') {
						if(element['is_checked']) {
							$('form[name='+formname+']').find('input[name='+escapeName(elementname)+'][value='+element['value']+']').attr('checked', 'checked');
						}
					}
					else if(type == 'select') {
						jQuery.each(element, function(value, is_selected) {
							$('form[name='+formname+']').find('select[name='+escapeName(elementname)+']').children('option').each( function() {
								if($(this).val() == value && is_selected) {
									$(this).attr('selected', 'selected');
								} 
							});
						});
					}
				});
			});
		}
		
		function hasValue(val, array) {
			for(var i = 0; i < array.length; i++) {
				if(array[i] == val) {
					return true;
				}
			}
			return false;
		}
		
		function escapeName(str) {
			str = str.replace(/\[/, '\\[');
			str = str.replace(/\]/, '\\]');
			return str;
		}
		
		function clear() {
			data.removeItem('autoStorage');
		}	
	};
})( jQuery );