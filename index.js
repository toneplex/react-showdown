
var React = require('react');
var showdown  = require('showdown');
var cheerio = require('cheerio');

/**
 * ReactShowdown can converts markdown to react elements.
 *
 * Example: new ReactShowdown().convert(markdown)
 */
module.exports = function ReactShowdown(options) {
	'use strict';
	var self = this;

	this._converter = new showdown.Converter(options && options.converter);

	this._components = {};
	for (var key in (options && options.components || {})) {
		this._components[key.toLowerCase()] = options.components[key];
	}

	this._mapElement = function(element) {
		if (element.type === 'tag') {
			var component = this._components[element.name] || element.name;
			return React.createElement(component, element.attribs, this._mapElements(element.children));
		} else if (element.type === 'text') {
			return element.data;
		} else {
			console.warn('Warning: Could not map element with type ' + element.type + ' yet.');
			return null;
		}
	};

	this._mapElements = function(elements) {
		return React.Children.toArray(elements.map(function(element) {
			return self._mapElement(element);
		}).filter(function(element) {
			return element;
		}));
	}

	this.convert = function(markdown) {
		var html = this._converter.makeHtml(markdown);
		var root = cheerio.load(html).root()[0];
		var reactElements = this._mapElements(root.children);
		if (reactElements.length === 1) {
			return reactElements[0];
		} else {
			return React.createElement('div', null, reactElements);
		}
	};
}