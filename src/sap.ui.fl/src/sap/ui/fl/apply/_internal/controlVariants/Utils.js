/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Variant"
], function(
	JsControlTreeModifier,
	Variant
) {
	"use strict";

	function getAssociatedControlId(aAssociatedControlIds, oControl) {
		if (!oControl) {
			return undefined;
		}

		if (aAssociatedControlIds.indexOf(oControl.getId()) > -1) {
			return oControl.getId();
		}
		return getAssociatedControlId(aAssociatedControlIds, oControl.getParent());
	}

	var VariantsApplyUtil = {
		DEFAULT_AUTHOR: "SAP",

		VARIANT_TECHNICAL_PARAMETER: "sap-ui-fl-control-variant-id",

		compareVariants: function(oVariantData1, oVariantData2) {
			if (oVariantData1.content.content.title.toLowerCase() < oVariantData2.content.content.title.toLowerCase()) {
				return -1;
			} else if (oVariantData1.content.content.title.toLowerCase() > oVariantData2.content.content.title.toLowerCase()) {
				return 1;
			}
			return 0;
		},

		getIndexToSortVariant: function (aVariants, oVariantData) {
			var iSortedIndex = aVariants.length;
			aVariants.some(function (oExistingVariantData, index) {
				if (VariantsApplyUtil.compareVariants(oVariantData, oExistingVariantData) < 0) {
					iSortedIndex = index;
					return true;
				}
			});
			return iSortedIndex;
		},

		/**
		 * Create a variant
		 *
		 * @param {object} mPropertyBag - Property Bag
		 * @param {object} mPropertyBag.variantSpecificData - Property bag (nvp) holding the variant information (see sap.ui.fl.Variant#createInitialFileContentoPropertyBag).
		 * The property "mPropertyBag.variantSpecificData.content.packageName" is set to $TMP internally since flex changes are always local when they are created.
		 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
		 * @returns {sap.ui.fl.Variant} The created variant
		 * @public
		 */
		createVariant: function(mPropertyBag) {
			var oVariant;
			var oVariantFileContent;
			var sVMReference = mPropertyBag.variantSpecificData.content.variantManagementReference;

			if (sVMReference) {
				var bValidId = JsControlTreeModifier.checkControlId(sVMReference, mPropertyBag.model.oAppComponent);
				if (!bValidId) {
					throw new Error("Generated ID attribute found - to offer flexibility a stable VariantManagement ID is needed to assign the changes to, but for this VariantManagement control the ID was generated by SAPUI5 " + sVMReference);
				}
			}

			mPropertyBag.variantSpecificData.content.reference = mPropertyBag.model.sFlexReference; //in this case the component name can also be the value of sap-app-id
			mPropertyBag.variantSpecificData.content.packageName = "$TMP"; // first a flex change is always local, until all changes of a component are made transportable

			oVariantFileContent = Variant.createInitialFileContent(mPropertyBag.variantSpecificData);
			oVariant = new Variant(oVariantFileContent);

			return oVariant;
		},

		/**
		 * Finds the responsible variant management control for a given control.
		 * A prerequisite for this to work is that the variant management control is reachable via the <code>getParent</code> function.
		 *
		 * @param {sap.ui.core.Control} oControl - Control instance
		 * @param {string[]} aVMControlIds - Array of variant management control IDs
		 * @returns {string} The ID of the responsible variant management control
		 */
		getRelevantVariantManagementControlId: function(oControl, aVMControlIds) {
			var oAssociatedControls = {};
			var aAssociatedControlIds = aVMControlIds.reduce(function(aCurrentControlIds, sVMControlId) {
				var oVMControl = sap.ui.getCore().byId(sVMControlId);
				var aForControls = oVMControl.getFor();
				aForControls.forEach(function(sControlId) {
					oAssociatedControls[sControlId] = sVMControlId;
				});
				return aCurrentControlIds.concat(aForControls);
			}, []);

			var sAssociatedVMControlId = getAssociatedControlId(aAssociatedControlIds, oControl);
			return oAssociatedControls[sAssociatedVMControlId];
		}
	};

	return VariantsApplyUtil;
});