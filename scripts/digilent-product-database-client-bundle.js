/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dist_digilent_product_database_client__ = __webpack_require__(1);

window.DigilentProductDatabaseClient = __WEBPACK_IMPORTED_MODULE_0__dist_digilent_product_database_client__["a" /* DigilentProductDatabaseClient */];

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DigilentProductDatabaseClient; });
var DigilentProductDatabaseClient = (function () {
    function DigilentProductDatabaseClient(baseUrl) {
        this.products = {};
        this.baseUrl = baseUrl;
    }
    //List all categories.  This function returns a promise that resolves with an a string array containing all category names.
    DigilentProductDatabaseClient.prototype.listCatagories = function () {
        return this.listObjectsInFolder('src/categories/', '.json');
    };
    //List all products in the specified category.  This function returns a promise that resolves with an a string array containing all product names in the specified category.
    DigilentProductDatabaseClient.prototype.listProducts = function (category) {
        return this.listFoldersInFolder('src/products/' + category + '/');
    };
    //Load all the products in the specified category into the products member variable.  This function returns a promise that resolves with a reference to the updated category sub-object of the products member variable.
    DigilentProductDatabaseClient.prototype.loadAllProductsInCategory = function (category) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.listObjectsInFolder('src/products/' + encodeURIComponent(category) + '/', '.json').then(function (products) {
                var tasks = [];
                products.forEach(function (product) {
                    console.log(product);
                    tasks.push(_this.loadProduct(category, product));
                });
                Promise.all(tasks).then(function (success) {
                    resolve(_this.products[category]);
                }, function (err) {
                    console.log(err);
                    reject(err);
                });
            });
        });
    };
    //Load the product descriptor from S3 into the products member variable.  This funtion returns a promise that resolves with a referenec to the updated product sub-object of the products member variable.
    DigilentProductDatabaseClient.prototype.loadProduct = function (category, product) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.httpRequest('GET', _this.baseUrl + 'src/products/' + category + '/' + encodeURIComponent(product) + '/' + encodeURIComponent(product) + '.json').then(function (descriptor) {
                console.log('adding ', category, product);
                //Initialize Category and Product objects if they DNE
                if (!_this.products[category]) {
                    _this.products[category] = {};
                }
                if (!_this.products[category][product]) {
                    _this.products[category][product] = {};
                }
                _this.products[category][product] = JSON.parse(descriptor).data;
                resolve(_this.products[category][product]);
            });
        });
    };
    //Update the HTML element with the specified elementId with the Infobox HTML generated from the specified productDescriptor.
    DigilentProductDatabaseClient.prototype.loadInfobox = function (elementId, productDescriptor, layout) {
        var _this = this;
        if (layout === void 0) { layout = null; }
        var element = document.getElementById(elementId);
        var infoboxHtml = '';
        if (layout) {
            //-----User specified section order-----
            //Top Buttons
            if (layout.sectionOrder.includes('Buttons')) {
                infoboxHtml += this.htmlInfoboxButtons(productDescriptor);
                layout.sectionOrder.splice(layout.sectionOrder.indexOf('Buttons'), 1);
            }
            //Start Main Section
            infoboxHtml += "<div class=\"infobox-table\">";
            //Common
            if (layout.sectionOrder.includes('Common')) {
                infoboxHtml += this.htmlInfoboxCommon(productDescriptor);
            }
            //Add user specified sections in order
            layout.sectionOrder.forEach(function (section) {
                if (layout[section]) {
                    //User specified properties
                    infoboxHtml += _this.htmlInfoboxSectionHeader(section);
                    layout[section].forEach(function (property) {
                        infoboxHtml += _this.htmlInfoboxProperty(productDescriptor[section], property);
                    });
                }
                else {
                    if (productDescriptor[section]) {
                        //Add all properties         
                        infoboxHtml += _this.htmlInfoboxSection(section, productDescriptor[section]);
                    }
                }
            });
            //End Main Section
            infoboxHtml += "</div>";
        }
        else {
            //Generate with default section order
            //Top Buttons
            infoboxHtml += this.htmlInfoboxButtons(productDescriptor);
            //Start Main Section
            infoboxHtml += "<div class=\"infobox-table\">";
            infoboxHtml += this.htmlInfoboxCommon(productDescriptor);
            //Add all sections except common
            Object.keys(productDescriptor).forEach(function (sectionName) {
                if (Object.keys((productDescriptor[sectionName]).length > 0)) {
                    //Section contains content, add it
                    if (sectionName == 'Common') {
                        //Do not add common section
                        return;
                    }
                    infoboxHtml += _this.htmlInfoboxSection(sectionName, productDescriptor[sectionName]);
                }
            });
            //End Main Section
            infoboxHtml += "</div>";
        }
        //Update HTML element with new content
        element.innerHTML = infoboxHtml;
    };
    //---------- Utilities ----------
    //Get the type of the specified property.  This function returns a string indicating type of the specified property.
    DigilentProductDatabaseClient.prototype.getPropertyType = function (property) {
        switch (typeof (property)) {
            case 'object':
                if (property.value && property.units) {
                    return 'engineeringNumberWithUnits';
                }
                if (property.valueMin && property.valueMax && property.units) {
                    return 'engineeringNumberRangeWithUnits';
                }
                return 'unknown';
            case 'string':
                //Check if its a file path
                if (property.substr(property.lastIndexOf('.')).length >= 0) {
                    return property.substr(property.lastIndexOf('.'));
                }
                else {
                    return 'string';
                }
            case 'undefined':
                return '-';
            default:
                return 'unknown';
        }
    };
    //Render the specified property.  This function returns a string generated from the porperty data.
    DigilentProductDatabaseClient.prototype.renderProperty = function (property) {
        if (!property) {
            return 'N/A';
        }
        var type = this.getPropertyType(property);
        switch (type) {
            case 'engineeringNumberWithUnits':
                return this.formatEngineeringNumber(property);
            case 'engineeringNumberRangeWithUnits':
                return property.valueMin + ' to ' + property.valueMax + ' ' + property.units;
            default:
                return property;
        }
    };
    //Convert the specified proptery to HTML and return it as a string
    DigilentProductDatabaseClient.prototype.propertyToHtml = function (property) {
        var type = this.getPropertyType(property);
        switch (type) {
            //Images
            case '.gif':
            case '.jpg':
            case '.jpeg':
            case '.png':
            case '.svg':
                return "<img src=\"" + property + "\">";
            case '.fzpz':
                return "<a href=\" " + property + "\"><img class=\"fileIcon\" src=\"" + this.baseUrl + "src/images/icons/fritzing.svg\"></a>";
            default:
                return this.renderProperty(property);
        }
    };
    //Return the specified engineering number property as a pretty string.
    DigilentProductDatabaseClient.prototype.formatEngineeringNumber = function (property) {
        //Convert unit name into unit symbol
        var units = property.units;
        switch (units) {
            case 'Amps':
                units = 'A';
                break;
            case 'Bits':
                units = 'bits';
                break;
            case 'Bits per second':
                units = 'b/s';
                break;
            case 'Bytes':
                units = 'B';
                break;
            case 'Bytes per second':
                units = 'B/s';
                break;
            case 'Hertz':
                units = 'Hz';
                break;
            case 'Ohms':
                units = 'Ω';
                break;
            case 'Samples':
                units = 'S';
                break;
            case 'Samples per second':
                units = 'S/s';
                break;
            case 'Volts':
                units = 'V';
                break;
            default:
                break;
        }
        var value = property.value;
        var parsedValue = parseFloat(value);
        var trueValue = parsedValue;
        if (value.indexOf('G') !== -1) {
            trueValue = parsedValue * Math.pow(10, 9);
        }
        else if (value.indexOf('M') !== -1) {
            trueValue = parsedValue * Math.pow(10, 6);
        }
        else if (value.indexOf('k') !== -1 || value.indexOf('K') !== -1) {
            trueValue = parsedValue * Math.pow(10, 3);
        }
        else if (value.indexOf('m') !== -1) {
            trueValue = parsedValue * Math.pow(10, -3);
        }
        else if (value.indexOf('u') !== -1) {
            trueValue = parsedValue * Math.pow(10, -6);
        }
        else if (value.indexOf('n') !== -1) {
            trueValue = parsedValue * Math.pow(10, -9);
        }
        if (trueValue > Math.pow(10, 9)) {
            trueValue = Math.pow(10, 9);
        }
        else if (trueValue < -Math.pow(10, 9)) {
            trueValue = -Math.pow(10, 9);
        }
        return this.transformNumeric(trueValue, units);
    };
    //---------- Private ----------
    //List all objects in the specified folder (and sub folders) with the specified extension.  This function returns a promise that resolves with an a string array containing the object names with the path and extension stripped.
    DigilentProductDatabaseClient.prototype.listObjectsInFolder = function (folderPath, extension) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.baseUrl) {
                console.log('Missing Product Database Base Url');
                reject('Missing Product Database Base Url');
            }
            _this.httpRequest('GET', _this.baseUrl + '?prefix=' + encodeURIComponent(folderPath)).then(function (data) {
                var parser = new DOMParser();
                var xml = parser.parseFromString(data, 'text/xml');
                var contents = xml.getElementsByTagName('Contents');
                var items = [];
                for (var i = 0; i < contents.length; i++) {
                    var file = contents[i].getElementsByTagName('Key')[0].firstChild.nodeValue;
                    if (file.substr(file.length - extension.length) == extension) {
                        file = file.substr(file.lastIndexOf('/') + 1);
                        items.push(file.substr(0, (file.length - extension.length)));
                    }
                }
                console.log('items - ', items);
                resolve(items);
            }, function (err) {
                console.log(err);
                reject(err);
            });
        });
    };
    //List all 'folders' under the specified folder (recursive).  This function returns a promise that resolves with an a string array containing the folder names with the path stripped.
    DigilentProductDatabaseClient.prototype.listFoldersInFolder = function (folderPath) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.baseUrl) {
                console.log('Missing Product Database Base Url');
                reject('Missing Product Database Base Url');
            }
            _this.httpRequest('GET', _this.baseUrl + '?prefix=' + encodeURIComponent(folderPath)).then(function (data) {
                var parser = new DOMParser();
                var xml = parser.parseFromString(data, 'text/xml');
                var contents = xml.getElementsByTagName('Contents');
                var items = [];
                for (var i = 0; i < contents.length; i++) {
                    var file = contents[i].getElementsByTagName('Key')[0].firstChild.nodeValue.substr(folderPath.length);
                    if (file.indexOf('/') > 0) {
                        file = file.substr(0, file.indexOf('/'));
                        items.push(file.substr(0, (file.length - file.indexOf('/'))));
                    }
                }
                //Filter unique items and resolve with data
                resolve(Array.from(new Set(items)));
            }, function (err) {
                console.log(err);
                reject(err);
            });
        });
    };
    //Send the specified HTTP request type to the specified URL.  This function returns a promise that resolves with the response from the endpooint.
    DigilentProductDatabaseClient.prototype.httpRequest = function (method, url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                }
                else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    };
    DigilentProductDatabaseClient.prototype.transformNumeric = function (value, baseUnit) {
        if (typeof (value) === 'string') {
            value = parseFloat(value);
        }
        if (value == 0 || Math.abs(value) < 1e-15) {
            return '0.000 ' + baseUnit;
        }
        var i = 0;
        var unit = ' ';
        if (Math.abs(value) < 1) {
            while (Math.abs(value) < 1 && i < 3) {
                i++;
                value = value * 1000;
            }
            if (i == 0) {
                unit = ' ';
            }
            else if (i == 1) {
                unit = ' m';
            }
            else if (i == 2) {
                unit = ' u';
            }
            else if (i == 3) {
                unit = ' n';
            }
        }
        else if (Math.abs(value) >= 1000) {
            while (Math.abs(value) >= 1000 && i < 3) {
                i++;
                value = value / 1000;
            }
            if (i == 0) {
                unit = ' ';
            }
            else if (i == 1) {
                unit = ' k';
            }
            else if (i == 2) {
                unit = ' M';
            }
            else if (i == 3) {
                unit = ' G';
            }
        }
        var valueCopyString = value.toString();
        var maxStringLength = value < 0 ? 5 : 4;
        var numDigitsBeforeDecimal = valueCopyString.indexOf('.');
        numDigitsBeforeDecimal = numDigitsBeforeDecimal === -1 ? valueCopyString.length : numDigitsBeforeDecimal;
        var toFixedParam = maxStringLength - numDigitsBeforeDecimal;
        toFixedParam = toFixedParam < 0 ? 0 : toFixedParam;
        valueCopyString = value.toFixed(toFixedParam);
        return valueCopyString + unit + baseUnit;
    };
    //--------- HTML Generators ---------
    DigilentProductDatabaseClient.prototype.htmlButton = function (label, target, cssClass) {
        if (cssClass === void 0) { cssClass = ''; }
        var css = 'btn-lg primary-btn';
        if (cssClass != '') {
            css = cssClass;
        }
        return "<a href='" + target + "' role='button' class='btn " + css + "'>" + label + "</a> ";
    };
    DigilentProductDatabaseClient.prototype.htmlInfoboxSection = function (sectionName, sectionDescriptor) {
        var _this = this;
        var html = '';
        if (Object.keys(sectionDescriptor).length <= 0) {
            return '';
        }
        else {
            html += this.htmlInfoboxSectionHeader(sectionName);
        }
        Object.keys(sectionDescriptor).forEach(function (key) {
            html += _this.htmlInfoboxKeyValue(sectionDescriptor, key);
        });
        html += " </div>";
        return html;
    };
    //Return an HTML string for a section header with the specified section name.
    DigilentProductDatabaseClient.prototype.htmlInfoboxSectionHeader = function (sectionName) {
        var html = " <div class=\"section\">\n                  <div class=\"section-header\">\n                    " + sectionName + "\n                  </div>";
        return html;
    };
    //Return an HTML string for rendering the specified value from the specified section.
    DigilentProductDatabaseClient.prototype.htmlInfoboxProperty = function (sectionDescriptor, key) {
        return this.htmlInfoboxKeyValue(sectionDescriptor, key);
    };
    //Return an HTML string for rendering the specified property as a key-value pair
    DigilentProductDatabaseClient.prototype.htmlInfoboxKeyValue = function (sectionDescriptor, key) {
        var html = " <div class=\"key-value\">\n                  <div class=\"key\">\n                    " + key + "\n                  </div>\n                    " + this.propertyToHtml(sectionDescriptor[key]) + "\n                  </div>";
        return html;
    };
    //Generate the HTML for the infobox buttons
    DigilentProductDatabaseClient.prototype.htmlInfoboxButtons = function (productDescriptor) {
        var html = '';
        if (productDescriptor.Common['Store Url']) {
            html += this.htmlButton('Store', productDescriptor.Common['Store Url']);
        }
        if (productDescriptor.Common['Getting Started Url']) {
            html += this.htmlButton('Getting Started', productDescriptor.Common['Getting Started Url']);
        }
        if (productDescriptor.Common['Reference Manual Url']) {
            html += this.htmlButton('Reference Manual', productDescriptor.Common['Reference Manual Url'], 'secondary-btn');
        }
        if (productDescriptor.Common['Technical Support Url']) {
            html += this.htmlButton('Technical Support', productDescriptor.Common['Technical Support Url'], 'secondary-btn');
        }
        return html;
    };
    //Generate the HTML for the infobox common section
    DigilentProductDatabaseClient.prototype.htmlInfoboxCommon = function (productDescriptor) {
        var html = '';
        //Title
        if (productDescriptor.Common['Name']) {
            html += "<div class=\"infobox-title\">" + productDescriptor.Common['Name'] + "</div>";
        }
        //Short Description
        if (productDescriptor.Common['Short Description']) {
            html += "<div class=\"infobox-subtitle\">" + productDescriptor.Common['Short Description'] + "</div>";
        }
        return html;
    };
    return DigilentProductDatabaseClient;
}());

//# sourceMappingURL=digilent-product-database-client.js.map

/***/ })
/******/ ]);