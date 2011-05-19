/**
 * Class: KmlObjectStore
 * 
 * A repository of KmlObjects linked to <GeoData> objects. Also 
 * handles creation of KmlObjects from <GeoData>.
 * 
 * Properties:
 *  ge - GEPlugin. Google Earth plugin instance. Used for creating 
 *        KmlObject instances.
 *  datastore - Object. Map where key is a <GeoData> ID and value is a KmlObject.
 * 
 * Namespace:
 *  core.gearth
 * 
 * Dependencies:
 *  - jQuery
 *  - core.ge.KmlObjectCreator
 *  - core.geo.KmlFeatureType
 */

if (!window.core)
	window.core = {};
if (!window.core.gearth)
	window.core.gearth = {};

(function(ns) {
	var KmlObjectCreator = core.gearth.KmlObjectCreator;
	if (!KmlObjectCreator)
		throw "Dependency not found: core.gearth.KmlObjectCreator";
	var KmlFeatureType = core.geo.KmlFeatureType;
	if (!KmlFeatureType)
		throw "Dependency not found: core.geo.KmlFeatureType";
	
	/**
	 * Constructor: KmlObjectStore
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   ge - GEPlugin. Google Earth plugin instance used for creating 
	 *         KmlObjects.
	 *   gex = GEarthExtensions.
	 *   kmlJsonProxyService - <KmlJsonProxyService>.
	 */
	var KmlObjectStore = function(ge, gex, kmlJsonProxyService) {
		this.ge = ge;
		this.datastore = {};
		this.kmlObjectCreator = new KmlObjectCreator(ge, gex, kmlJsonProxyService);
	};
	KmlObjectStore.prototype = {
		
		/**
		 * Property: ge
		 * 
		 * Google Earth Plugin.
		 */
		ge: null,
		
		/**
		 * Property: kmlObjectCreator
		 * 
		 * <KmlObjectCreator>. Used to convert <GeoData> into KmlObjects.
		 */
		kmlObjectCreator: null,

		/**
		 * Function: getKmlObject
		 * 
		 * Retrieves the KmlObject linked to a GeoData object. If the 
		 * record doesn't exist, returns null.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. Linked GeoData object.
		 */
		getKmlObject: function(geoData) {
			console.log("getKmlObject(" + geoData.getName() + ")");
			console.log(geoData);
			var kmlObject = null, id, parentGeoData, parentKmlObject, 
				kmlObjectType, childKmlObjectList, i, childKmlObject, 
				childGeoDataId;
			kmlObject = null;
			if (geoData) {
				id = geoData.id;
				if (id && id in this.datastore) {
					kmlObject = this.datastore[id];
				}
				else {
					console.log(id + " doesn't exist in store");
					// parent geoData might be in the store. if so, find it, 
					// then search its children.
					parentGeoData = geoData.getParent();
					if (parentGeoData) {
						parentKmlObject = this.getKmlObject(parentGeoData);
						if (parentKmlObject) {
							console.log("Found parent KmlObject in store " + parentKmlObject);
							
							// search children
							var findChild = function(nextParent) {
								var onChild = function(child) {
									
								};
								var onComplete = function() {
									
								};
								var onError = function() {
									
								};
								nextParent.iterateChildren(onChild, onComplete, onError);
							};
							
							
							if (kmlObjectType) {
								childKmlObjectList = parentKmlObject.getElementsByType(kmlObjectType);
								// var childKmlObjectList = parentKmlObject.getFeatures().getChildNodes();
								for (i = 0; i < childKmlObjectList.getLength(); i++) {
									childKmlObject = childKmlObjectList.item(i);
									childGeoDataId = this.kmlObjectCreator.getGeoDataId(childKmlObject);
									if (childGeoDataId === id) {
										return childKmlObject;
									}
								}
							}
						}
					}
				}
			}
			return kmlObject;
		},
		
		getKmlObjectType: function(geodata) {
			if (geodata) {
				var kmlFeatureType = geodata.getKmlFeatureType();
				if (kmlFeatureType) {
					switch (kmlFeatureType) {
					case KmlFeatureType.NETWORK_LINK:
						return "KmlNetworkLink";
					case KmlFeatureType.PLACEMARK:
						return "KmlPlacemark";
					case KmlFeatureType.PHOTO_OVERLAY:
						return "KmlPhotoOverlay";
					case KmlFeatureType.SCREEN_OVERLAY:
						return "KmlScreenOverlay";
					case KmlFeatureType.GROUND_OVERLAY:
						return "KmlGroundOverlay";
					case KmlFeatureType.FOLDER:
						return "KmlFolder";
					case KmlFeatureType.DOCUMENT:
						return "KmlDocument";
					}
				}
			}
			return null;
		},

		/**
		 * Function: getKmlObject
		 * 
		 * Retrieves the KmlObject linked to a GeoData object. If the 
		 * record doesn't exist, a new KmlObject is created.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. Linked GeoData object.
		 *   callback - Function. Invoked upon successful KmlObject retrieval.
		 */
		getOrCreateKmlObject: function(geoData, callback) {
			console.log("getOrCreateKmlObject(" + geoData + ", " + callback + ")");
			if (geoData && geoData.id) {
				var kmlObject = this.getKmlObject(geoData);
				if (kmlObject) {
					console.log("Already exists");
					// use the KmlObject from the store
					callback.call(callback, kmlObject);
				}
				else {
					// create a new KmlObject
					var _this = this;
					var id = geoData.id;
					this.kmlObjectCreator.createFromGeoData.call(
							this.kmlObjectCreator, 
							geoData, 
							function(kmlObject) {
								_this.datastore[id] = kmlObject;
								console.log("Created KmlObject " + kmlObject + " for ID " + id);
								callback.call(callback, kmlObject);
							});
				}
			}
			else {
				console.log("Invalid geodata: " + geoData + ", " + geoData.id);
				// invalid GeoData provided
				callback.call(callback, null);
			}
		},

		/**
		 * Function: removeKmlObject
		 * 
		 * Removes the KmlObject from the repository linked to a GeoData 
		 * instance.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. Linked GeoData object.
		 */
		removeKmlObject: function(geoData) {
			delete this.datastore[geoData.id];
		}
		
	};
	ns.KmlObjectStore = KmlObjectStore;
})(window.core.gearth);