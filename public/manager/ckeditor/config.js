/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
    config.filebrowserUploadUrl = "/manager/community/ckeditor/upload";
    config.extraPlugins = 'lineutils';
    config.extraPlugins = 'widgetselection';
    config.extraPlugins = 'widget';
    config.extraPlugins = 'html5video';
    config.extraPlugins = 'youtube';
};
