/* global QUnit */

sap.ui.define([
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/plugin/ToolHooks",
	"sap/m/Button",
	"sap/ui/core/Core"
],
function(
	ElementOverlay,
	ToolHooks,
	Button,
	oCore
) {
	"use strict";

	QUnit.module("Given an overlay and a ToolHooks plugin...", {
		beforeEach(assert) {
			this.oButton = new Button({
				text: "Button"
			});
			this.oButton.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oElementOverlay = new ElementOverlay({
				isRoot: true,
				element: this.oButton,
				designTimeMetadata: {},
				init: assert.async()
			});
			this.oToolHooksPlugin = new ToolHooks();
		},
		afterEach() {
			this.oElementOverlay.destroy();
			this.oButton.destroy();
			this.oToolHooksPlugin.destroy();
		}
	}, function() {
		QUnit.test("with both functions in DesignTimeMetadata", function(assert) {
			assert.expect(2);
			var sButtonId = this.oButton.getId();
			this.oElementOverlay.setDesignTimeMetadata({
				tool: {
					start(oButton) {
						assert.equal(oButton.getId(), sButtonId, "the function was called with the control as parameter");
					},
					stop(oButton) {
						assert.equal(oButton.getId(), sButtonId, "the function was called with the control as parameter");
					}
				}
			});
			this.oToolHooksPlugin.registerElementOverlay(this.oElementOverlay);
			this.oToolHooksPlugin.deregisterElementOverlay(this.oElementOverlay);
		});

		QUnit.test("with both entries not being a function in DesignTimeMetadata", function(assert) {
			this.oElementOverlay.setDesignTimeMetadata({
				tool: {
					start: "notAFunction",
					stop: "notAFunction"
				}
			});
			assert.throws(function() {this.oToolHooksPlugin.registerElementOverlay(this.oElementOverlay);});
			assert.throws(function() {this.oToolHooksPlugin.deregisterElementOverlay(this.oElementOverlay);});
		});

		QUnit.test("with no tool section in DesignTimeMetadata", function(assert) {
			this.oToolHooksPlugin.registerElementOverlay(this.oElementOverlay);
			this.oToolHooksPlugin.deregisterElementOverlay(this.oElementOverlay);
			assert.ok(true, "the function does not throw an error");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});