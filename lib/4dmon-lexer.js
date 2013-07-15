/*global window */
/*jshint unused:false */

// [implement] Just ignore unused vars while things are
// stubbded [/implement]

/*
 * 4dmon-lexer
 * http://jtrussell-ivantage.github.io/4dmon-lexer
 *
 * Copyright (c) 2013 Justin Russell
 * Licensed under the MIT license.
 */

'use strict';

(function() {
  var exports = {};

  // -----------------------------------------------------
  // Node land or browser land?
  // -----------------------------------------------------
  if(typeof module !== 'undefined') {
    exports = module.exports;
  } else if(typeof window !== 'undefined') {
    exports = window.fourdmon = window.fourdmon || {};
  }

  exports.Lexer = function() {

    var UNDEFINED // Leave this undefined

      // RegExps
      , COMMENT
      , DOUBLE_QUOTE_STRING
      , EOL_TRAILING_WHITESPACE
      , IDENTIFIER
      , IDENTIFIER_GLOBAL
      , IDENTIFIER_LOCAL
      , IDENTIFIER_INVOKED
      , NEW_LINE
      , NUMBER
      , TRAILING_WHITESPACE
      , WHITESPACE
      , ASSIGNMENT
      , SEPARATOR

      // Token Groups
      , FOURD_COMMANDS // TAG: FOURD_COMMAND
      , FOURD_CONSTANTS // TAG: FOURD_CONSTANT
      , FOURD_KEYWORDS // TAG: FOURD_KEYWORD
      , COMPARE
      , LOGIC
      , ARITHMATIC

      // Convenience Hash Objects
      // lowercase keyword --> proper capitalization keyword
      , FOURD_COMMANDS_HASH = {}
      , FOURD_CONSTANTS_HASH = {}
      , FOURD_KEYWORDS_HASH = {}

      // Microsoft shenanigans
      , BOM = 65279;

    this.tokenize = function(code, opts) {
      var i = 0; // "Cursor" as we move through code block

      opts = opts || {};
      this.chunk = this.clean(code);
      this.tokens = []; // Parsed tokens, [['TYPE', value, location data], ...]
      this.ends = []; // stack for pairing tokens
      this.indent = opts.indent || 0;

      while(this.chunk) {
        // NOTE: the order below defines precedence
        i = this.commentToken()
            || this.lineToken()
            || this.whitespaceToken()
            || this.numberToken()
            || this.separatorToken()
            || this.operatorToken()
            || this.stringToken()
            || this.reservedToken()
            || this.identifierToken();

        // [todo] Better error handling. For now just don't loop forever [/todo]
        if(isNaN(i)) { throw 'Could not parse: ' + this.chunk; }

        this.chunk = this.chunk.slice(i); // [todo] benchmark against substring? [/todo]
      }

      return this.tokens;
    };

    this.clean = function(code) {
      if(!code) { return ''; } // We can't do much with anything falsy
      if(code.charCodeAt(0) === BOM) { code = code.slice(1); }
      return code
        .replace(/\r/g, '') // Newline chars only kthanks!
        .replace(EOL_TRAILING_WHITESPACE, '') // 4D ignores ws at the end of lines
        .replace(TRAILING_WHITESPACE, '');
    };

    // Provide a way to add custom project methods, plugin methods, process vars,
    // etc. that we want to add to the grammar
    this.mixin = function(tag, toks) {
      toks = toks instanceof Array ? toks : [toks]; // Pass array or single item
    };

    // -----------------------------------------------------
    // Token chompers... these all take a look at `this.chunk` and see if it
    // starts with a token they recognize. If they find a token, the return its
    // *length* put a reference to that token on `this.tokens` stack by making a
    // call to `this.token`
    // -----------------------------------------------------

    this.basicToken = function(regexp, tag) {
      var tok = regexp.exec(this.chunk);
      if(!tok) { return UNDEFINED; }
      this.token(tag, tok[0], 0, tok[0].length);
      return tok[0].length;
    };

    this.identifierToken = function() {
      var identifier = this.basicToken(IDENTIFIER_GLOBAL, 'IDENTIFIER_GLOBAL')
        || this.basicToken(IDENTIFIER_LOCAL, 'IDENTIFIER_LOCAL')
        || this.basicToken(IDENTIFIER_INVOKED, 'IDENTIFIER_INVOKED');

      if(identifier) { return identifier; }

      identifier = IDENTIFIER.exec(this.chunk);
      if(!identifier) { return UNDEFINED; }

      // -----------------------------------------------------
      // [implement] Check with our recognized project methods, plugin methods,
      // etc. [/implement]
      // -----------------------------------------------------
      this.token('IDENTIFIER', identifier[0], 0, identifier[0].length);
      return identifier[0].length;
    };

    this.commentToken = function() {
      return this.basicToken(COMMENT, 'COMMENT');
    };

    this.whitespaceToken = function() {
      return this.basicToken(WHITESPACE, 'WHITESPACE');
    };

    this.lineToken = function() {
      return this.basicToken(NEW_LINE, 'NEW_LINE');
    };

    this.literalToken = function() {
      // [implement /]
    };

    this.numberToken = function() {
      // [todo] Does 4D do e.g. hex literals? I don't even know. [/todo]
      return this.basicToken(NUMBER, 'NUMBER');
    };

    this.separatorToken = function() {
      return this.basicToken(SEPARATOR, 'SEPARATOR');
    };

    this.operatorToken = function() {
      var value = this.basicToken(LOGIC, 'OPERATOR_LOGIC');
      if(value) { return value; }
      value = this.basicToken(ARITHMATIC, 'OPERATOR_ARITHATIC');
      if(value) { return value; }
      value = this.basicToken(ASSIGNMENT, 'OPERATOR_ASSIGNMENT');
      if(value) { return value; }
      value = this.basicToken(COMPARE, 'OPERATOR_COMPARE');
      return value;
    };

    this.stringToken = function() {
      return this.basicToken(DOUBLE_QUOTE_STRING, 'STRING');
    };

    this.reservedToken = function() {
      // luckily all reserved words are otherwise valid identifiers
      // [todo] These are basically things which could be identifiers but are
      // actually claimed by the language already, or has been already declared as
      // a method [/todo]
      var identifier = IDENTIFIER.exec(this.chunk)
        , candidate
        , candidateOrig
        , tag
        , value
        , token
        , offsetInChunk = 0
        , ix;

      if(!identifier) { return UNDEFINED; }
      candidateOrig = identifier[0];
      candidate = candidateOrig.toLowerCase();

      // The next token looks like a method/process variable see if it's one of
      // our recognized reserved tokens

      if(FOURD_COMMANDS_HASH.hasOwnProperty(candidate)) {
        tag = 'FOURD_COMMAND';
        value = FOURD_COMMANDS_HASH[candidate];
      }

      if(tag && value) {
        this.token(tag, value, offsetInChunk, value.length);
        return value.length;
      }

      return UNDEFINED;

    };

    // -----------------------------------------------------
    // Helpers
    // -----------------------------------------------------

    this.getLineAndColumnFromChunk = function(offset) {
      return {
        // [todo /]
      };
    };

    this.makeToken = function(tag, value, offsetInChunk, length) {
      var locationData = {};

      return [tag, value, locationData];
    };

    this.token = function(tag, value, offsetInChunk, length) {
      var token = this.makeToken(tag, value, offsetInChunk, length);
      this.tokens.push(token);
      return token;
    };

    // -----------------------------------------------------
    // Token matching Regexps
    // - - -
    // These describe our token types
    // -----------------------------------------------------
    IDENTIFIER = /^[\w]+(?: +\w+)*/;

    IDENTIFIER_GLOBAL = new RegExp('^<>' + IDENTIFIER.source.slice(1));

    IDENTIFIER_LOCAL = new RegExp('^\\$' + IDENTIFIER.source.slice(1));

    // We can tell something is a method is it's passed params... Still could be
    // a built in or a plugin method though. The 4D method editor 'cleans up' your
    // code by making sure there is a space between methods and opening parens...
    // we'll be a little generous and allow for any amount of (non-newline) space
    // between methods and parens.
    IDENTIFIER_INVOKED = new RegExp(IDENTIFIER.source + '(?=[^\\S\\n]*\\()');

    COMMENT = /^\/\/.*/; // Note we ignore the old "`" comments

    NEW_LINE = /^\n/;

    NUMBER = /^\d+/;

    DOUBLE_QUOTE_STRING = /^"[^\\"]*(?:\\.[^\\"]*)*"/;

    EOL_TRAILING_WHITESPACE = /[^\S\n]+(?=\n)/g;

    TRAILING_WHITESPACE = /\s+$/;

    WHITESPACE = /^[^\n\S]+/;

    ASSIGNMENT = /^:=/;

    SEPARATOR = /^[;()]/;

    LOGIC = /^[&|]/;

    ARITHMATIC = /^[+\-*\/]/;

    COMPARE = /^(?:<=?|>=?|=|#)/;


    // -----------------------------------------------------
    // Token literals and groups of token literals
    // - - -
    // These are matched in a case insensitive manner, however, the lexing process
    // will leave them in the case they appear here.
    // -----------------------------------------------------

    FOURD_COMMANDS = [
      'ABORT', 'Abs', 'ACCEPT', 'ACCUMULATE', 'Activated', 'ADD DATA SEGMENT', 'ADD RECORD',
      'ADD SUBRECORD', 'Add to date', 'ADD TO SET', 'After', 'ALERT', 'ALL RECORDS',
      'ALL SUBRECORDS', 'APPEND DATA TO PASTEBOARD', 'Append document', 'APPEND MENU ITEM',
      'APPEND TO ARRAY', 'APPEND TO LIST', 'Application file', 'Application type',
      'Application version', 'APPLY TO SELECTION', 'APPLY TO SUBSELECTION', 'Arctan',
      'ARRAY BOOLEAN', 'ARRAY DATE', 'ARRAY INTEGER', 'ARRAY LONGINT', 'ARRAY PICTURE',
      'ARRAY POINTER', 'ARRAY REAL', 'ARRAY STRING', 'ARRAY TEXT', 'ARRAY TO LIST',
      'ARRAY TO SELECTION', 'ARRAY TO STRING LIST', 'ASSERT', 'Asserted', 'BACKUP',
      'BASE64 DECODE', 'BASE64 ENCODE', 'BEEP', 'Before', 'Before selection', 'Before subselection',
      'Begin SQL', 'BLOB PROPERTIES', 'BLOB size', 'BLOB TO DOCUMENT', 'BLOB to integer',
      'BLOB to list', 'BLOB to longint', 'BLOB TO PICTURE', 'BLOB to real', 'BLOB to text',
      'BLOB TO USERS', 'BLOB TO VARIABLE', 'BOOLEAN ARRAY FROM SET', 'BREAK LEVEL',
      'BRING TO FRONT', 'BUILD APPLICATION', 'C_BLOB', 'C_BOOLEAN', 'C_DATE', 'C_GRAPH',
      'C_INTEGER', 'C_LONGINT', 'C_PICTURE', 'C_POINTER', 'C_REAL', 'C_STRING', 'C_TEXT',
      'C_TIME', 'CALL PROCESS', 'CALL SUBFORM CONTAINER', 'CANCEL', 'CANCEL TRANSACTION',
      'Caps lock down', 'CHANGE CURRENT USER', 'CHANGE LICENSES', 'CHANGE PASSWORD',
      'Change string', 'Char', 'Character code', 'CHECK LOG FILE', 'Choose', 'CLEAR LIST',
      'CLEAR NAMED SELECTION', 'CLEAR PASTEBOARD', 'CLEAR SEMAPHORE', 'CLEAR SET',
      'CLEAR VARIABLE', 'CLOSE DOCUMENT', 'CLOSE PRINTING JOB', 'CLOSE RESOURCE FILE',
      'CLOSE WINDOW', 'COMBINE PICTURES', 'Command name', 'Compact data file', 'COMPONENT LIST',
      'COMPRESS BLOB', 'CONFIRM', 'Contextual click', 'Convert case', 'CONVERT FROM TEXT',
      'Convert path POSIX to system', 'Convert path system to POSIX', 'CONVERT PICTURE',
      'Convert to text', 'COPY ARRAY', 'COPY BLOB', 'COPY DOCUMENT', 'Copy list',
      'COPY NAMED SELECTION', 'COPY SET', 'Cos', 'Count in array', 'Count list items',
      'Count menu items', 'Count menus', 'Count parameters', 'Count screens', 'Count tasks',
      'Count user processes', 'Count users', 'CREATE ALIAS', 'CREATE DATA FILE', 'Create document',
      'CREATE EMPTY SET', 'CREATE FOLDER', 'CREATE INDEX', 'Create menu', 'CREATE RECORD',
      'CREATE RELATED ONE', 'Create resource file', 'CREATE SELECTION FROM ARRAY',
      'CREATE SET', 'CREATE SET FROM ARRAY', 'CREATE SUBRECORD', 'CREATE THUMBNAIL',
      'CREATE USER FORM', 'Current date', 'Current default table', 'Current form table',
      'Current form window', 'Current machine', 'Current machine owner', 'Current method name',
      'Current method path', 'Current process', 'Current time', 'Current user', 'CUT NAMED SELECTION',
      'Data file', 'DATA SEGMENT LIST', 'Date', 'Day number', 'Day of', 'Deactivated',
      'Dec', 'DECRYPT BLOB', 'DEFAULT TABLE', 'DELAY PROCESS', 'DELETE DOCUMENT',
      'DELETE FOLDER', 'DELETE FROM ARRAY', 'DELETE FROM BLOB', 'DELETE FROM LIST',
      'DELETE INDEX', 'DELETE MENU ITEM', 'DELETE RECORD', 'DELETE RESOURCE', 'DELETE SELECTION',
      'Delete string', 'DELETE SUBRECORD', 'DELETE USER', 'DELETE USER FORM', 'DESCRIBE QUERY EXECUTION',
      'DIALOG', 'DIFFERENCE', 'DISABLE BUTTON', 'DISABLE MENU ITEM', 'DISPLAY NOTIFICATION',
      'DISPLAY RECORD', 'DISPLAY SELECTION', 'Displayed line number', 'DISTINCT VALUES',
      'Document creator', 'DOCUMENT LIST', 'DOCUMENT TO BLOB', 'Document type', 'DOM Append XML child node',
      'DOM Append XML element', 'DOM CLOSE XML', 'DOM Count XML attributes', 'DOM Count XML elements',
      'DOM Create XML element', 'DOM Create XML element arrays', 'DOM Create XML Ref',
      'DOM EXPORT TO FILE', 'DOM EXPORT TO VAR', 'DOM Find XML element', 'DOM Find XML element by ID',
      'DOM Get first child XML element', 'DOM Get last child XML element', 'DOM Get next sibling XML element',
      'DOM Get parent XML element', 'DOM Get previous sibling XML element', 'DOM Get Root XML element',
      'DOM GET XML ATTRIBUTE BY INDEX', 'DOM GET XML ATTRIBUTE BY NAME', 'DOM GET XML CHILD NODES',
      'DOM Get XML document ref', 'DOM Get XML element', 'DOM GET XML ELEMENT NAME',
      'DOM GET XML ELEMENT VALUE', 'DOM Get XML information', 'DOM Insert XML element',
      'DOM Parse XML source', 'DOM Parse XML variable', 'DOM REMOVE XML ATTRIBUTE',
      'DOM REMOVE XML ELEMENT', 'DOM SET XML ATTRIBUTE', 'DOM SET XML DECLARATION',
      'DOM SET XML ELEMENT NAME', 'DOM SET XML ELEMENT VALUE', 'DRAG AND DROP PROPERTIES',
      'DRAG WINDOW', 'Drop position', 'DUPLICATE RECORD', 'During', 'Dynamic pop up menu',
      'EDIT ACCESS', 'EDIT FORM', 'EDIT FORMULA', 'EDIT ITEM', 'ENABLE BUTTON', 'ENABLE MENU ITEM',
      'ENCRYPT BLOB', 'End selection', 'End SQL', 'End subselection', 'Equal pictures',
      'ERASE WINDOW', 'Euro converter', 'EXECUTE FORMULA', 'EXECUTE METHOD', 'EXECUTE METHOD IN SUBFORM',
      'EXECUTE ON CLIENT', 'Execute on server', 'Exp', 'EXPAND BLOB', 'EXPORT DATA',
      'EXPORT DIF', 'EXPORT ODBC', 'EXPORT SYLK', 'EXPORT TEXT', 'False', 'Field',
      'Field name', 'FILTER EVENT', 'FILTER KEYSTROKE', 'Find in array', 'Find in field',
      'Find in list', 'Find window', 'FIRST RECORD', 'FIRST SUBRECORD', 'FLUSH BUFFERS',
      'Focus object', 'FOLDER LIST', 'FONT LIST', 'Font name', 'Font number', 'Form event',
      'FORM FIRST PAGE', 'FORM Get current page', 'FORM GET HORIZONTAL RESIZING',
      'FORM GET NAMES', 'FORM GET OBJECTS', 'FORM GET PARAMETER', 'FORM GET PROPERTIES',
      'FORM GET VERTICAL RESIZING', 'FORM GOTO PAGE', 'FORM LAST PAGE', 'FORM NEXT PAGE',
      'FORM PREVIOUS PAGE', 'FORM SCREENSHOT', 'FORM SET HORIZONTAL RESIZING', 'FORM SET INPUT',
      'FORM SET OUTPUT', 'FORM SET SIZE', 'FORM SET VERTICAL RESIZING', 'Frontmost process',
      'Frontmost window', 'GENERATE CERTIFICATE REQUEST', 'Generate digest', 'GENERATE ENCRYPTION KEYPAIR',
      'Generate UUID', 'Gestalt', 'Get 4D folder', 'GET ALLOWED METHODS', 'Get assert enabled',
      'GET AUTOMATIC RELATIONS', 'GET BACKUP INFORMATION', 'Get component resource ID',
      'Get current data source', 'Get current printer', 'GET DATA SOURCE LIST', 'Get database localization',
      'Get database parameter', 'Get default user', 'GET DOCUMENT ICON', 'Get document position',
      'GET DOCUMENT PROPERTIES', 'Get document size', 'Get edited text', 'Get external data path',
      'GET FIELD ENTRY PROPERTIES', 'GET FIELD PROPERTIES', 'GET FIELD RELATION',
      'GET FIELD TITLES', 'Get file from pasteboard', 'GET GROUP LIST', 'GET GROUP PROPERTIES',
      'GET HIGHLIGHT', 'GET HIGHLIGHTED RECORDS', 'GET ICON RESOURCE', 'Get indexed string',
      'GET LAST ERROR STACK', 'Get last field number', 'Get Last Query Path', 'Get Last Query Plan',
      'Get last table number', 'GET LIST ITEM', 'Get list item font', 'GET LIST ITEM ICON',
      'GET LIST ITEM PARAMETER', 'GET LIST ITEM PARAMETER ARRAYS', 'GET LIST ITEM PROPERTIES',
      'GET LIST PROPERTIES', 'Get localized document path', 'Get localized string',
      'GET MACRO PARAMETER', 'GET MEMORY STATISTICS', 'Get menu bar reference', 'Get menu item',
      'GET MENU ITEM ICON', 'Get menu item key', 'Get menu item mark', 'Get menu item method',
      'Get menu item modifiers', 'Get menu item parameter', 'GET MENU ITEM PROPERTY',
      'Get menu item style', 'GET MENU ITEMS', 'Get menu title', 'GET MISSING TABLE NAMES',
      'GET MOUSE', 'GET PASTEBOARD DATA', 'GET PASTEBOARD DATA TYPE', 'Get picture file name',
      'GET PICTURE FROM LIBRARY', 'GET PICTURE FROM PASTEBOARD', 'GET PICTURE KEYWORDS',
      'GET PICTURE METADATA', 'GET PICTURE RESOURCE', 'Get platform interface', 'Get plugin access',
      'Get pointer', 'Get print marker', 'GET PRINT OPTION', 'Get print preview',
      'GET PRINTABLE AREA', 'GET PRINTABLE MARGIN', 'Get printed height', 'GET PROCESS VARIABLE',
      'GET QUERY DESTINATION', 'Get query limit', 'GET REGISTERED CLIENTS', 'GET RELATION PROPERTIES',
      'GET RESOURCE', 'Get resource name', 'Get resource properties', 'GET RESTORE INFORMATION',
      'Get selected menu item parameter', 'GET SERIAL INFORMATION', 'GET SERIAL PORT MAPPING',
      'Get string resource', 'Get subrecord key', 'GET SYSTEM FORMAT', 'Get table fragmentation',
      'GET TABLE PROPERTIES', 'GET TABLE TITLES', 'Get text from pasteboard', 'GET TEXT KEYWORDS',
      'Get text resource', 'GET USER LIST', 'GET USER PROPERTIES', 'GET WINDOW RECT',
      'Get window title', 'GOTO OBJECT', 'GOTO RECORD', 'GOTO SELECTED RECORD', 'GOTO XY',
      'GRAPH', 'GRAPH SETTINGS', 'GRAPH TABLE', 'HIDE MENU BAR', 'HIDE PROCESS', 'HIDE TOOL BAR',
      'HIDE WINDOW', 'HIGHLIGHT RECORDS', 'HIGHLIGHT TEXT', 'HTTP AUTHENTICATE', 'HTTP Get',
      'HTTP Get option', 'HTTP Request', 'HTTP SET OPTION', 'IDLE', 'IMPORT DATA',
      'IMPORT DIF', 'IMPORT ODBC', 'IMPORT SYLK', 'IMPORT TEXT', 'In break', 'In footer',
      'In header', 'In transaction', 'INSERT IN ARRAY', 'INSERT IN BLOB', 'INSERT IN LIST',
      'INSERT MENU ITEM', 'Insert string', 'Int', 'INTEGER TO BLOB', 'INTEGRATE LOG FILE',
      'INTERSECTION', 'INVERT BACKGROUND', 'Is a list', 'Is a variable', 'Is compiled mode',
      'Is data file locked', 'Is field number valid', 'Is field value Null', 'Is in print preview',
      'Is in set', 'Is license available', 'Is new record', 'Is picture file', 'Is record loaded',
      'Is table number valid', 'Is user deleted', 'ISO to Mac', 'Keystroke', 'LAST RECORD',
      'LAST SUBRECORD', 'LAUNCH EXTERNAL PROCESS', 'Length', 'Level', 'List item parent',
      'List item position', 'LIST OF CHOICE LISTS', 'LIST TO ARRAY', 'LIST TO BLOB',
      'LIST USER FORMS', 'LISTBOX COLLAPSE', 'LISTBOX DELETE COLUMN', 'LISTBOX DELETE ROWS',
      'LISTBOX EXPAND', 'LISTBOX GET ARRAYS', 'LISTBOX GET CELL POSITION', 'LISTBOX Get column formula',
      'LISTBOX Get column width', 'LISTBOX Get footer calculation', 'LISTBOX Get footers height',
      'LISTBOX GET GRID', 'LISTBOX GET GRID COLORS', 'LISTBOX Get headers height',
      'LISTBOX GET HIERARCHY', 'LISTBOX Get information', 'LISTBOX Get locked columns',
      'LISTBOX Get number of columns', 'LISTBOX Get number of rows', 'LISTBOX GET PRINT INFORMATION',
      'LISTBOX Get rows height', 'LISTBOX Get static columns', 'LISTBOX GET TABLE SOURCE',
      'LISTBOX INSERT COLUMN', 'LISTBOX INSERT COLUMN FORMULA', 'LISTBOX INSERT ROWS',
      'LISTBOX MOVED COLUMN NUMBER', 'LISTBOX MOVED ROW NUMBER', 'LISTBOX SELECT BREAK',
      'LISTBOX SELECT ROW', 'LISTBOX SET COLUMN FORMULA', 'LISTBOX SET COLUMN WIDTH',
      'LISTBOX SET FOOTER CALCULATION', 'LISTBOX SET FOOTERS HEIGHT', 'LISTBOX SET GRID',
      'LISTBOX SET GRID COLOR', 'LISTBOX SET HEADERS HEIGHT', 'LISTBOX SET HIERARCHY',
      'LISTBOX SET LOCKED COLUMNS', 'LISTBOX SET ROWS HEIGHT', 'LISTBOX SET STATIC COLUMNS',
      'LISTBOX SET TABLE SOURCE', 'LISTBOX SORT COLUMNS', 'Load list', 'LOAD RECORD',
      'LOAD SET', 'LOAD VARIABLES', 'Locked', 'LOCKED ATTRIBUTES', 'Log', 'LOG EVENT',
      'Log File', 'LONGINT ARRAY FROM SELECTION', 'LONGINT TO BLOB', 'Lowercase',
      'Mac to ISO', 'Mac to Win', 'Macintosh command down', 'Macintosh control down',
      'Macintosh option down', 'MAP FILE TYPES', 'Match regex', 'Max', 'MAXIMIZE WINDOW',
      'Menu bar height', 'Menu bar screen', 'Menu selected', 'MESSAGE', 'MESSAGES OFF',
      'MESSAGES ON', 'Method called on error', 'Method called on event', 'METHOD Get attribute',
      'METHOD GET CODE', 'METHOD GET COMMENTS', 'METHOD GET FOLDERS', 'METHOD GET MODIFICATION DATE',
      'METHOD GET NAMES', 'METHOD Get path', 'METHOD GET PATHS', 'METHOD GET PATHS FORM',
      'METHOD OPEN PATH', 'METHOD RESOLVE PATH', 'METHOD SET ACCESS MODE', 'METHOD SET ATTRIBUTE',
      'METHOD SET CODE', 'METHOD SET COMMENTS', 'Milliseconds', 'Min', 'MINIMIZE WINDOW',
      'Mod', 'Modified', 'Modified record', 'MODIFY RECORD', 'MODIFY SELECTION', 'MODIFY SUBRECORD',
      'Month of', 'MOVE DOCUMENT', 'MULTI SORT ARRAY', 'New list', 'New log file',
      'New process', 'NEXT RECORD', 'NEXT SUBRECORD', 'Next window', 'Nil', 'NO DEFAULT TABLE',
      'NO TRACE', 'Not', 'NOTIFY RESOURCES FOLDER MODIFICATION', 'Num', 'On Drop Database Method',
      'OBJECT DUPLICATE', 'OBJECT Get auto spellcheck', 'OBJECT GET BEST SIZE', 'OBJECT Get choice list name',
      'OBJECT GET COORDINATES', 'OBJECT GET DRAG AND DROP OPTIONS', 'OBJECT Get enabled',
      'OBJECT Get enterable', 'OBJECT Get filter', 'OBJECT Get focus rectangle invisible',
      'OBJECT Get font', 'OBJECT Get font size', 'OBJECT Get font style', 'OBJECT Get format',
      'OBJECT Get help tip', 'OBJECT Get horizontal alignment', 'OBJECT Get keyboard layout',
      'OBJECT Get name', 'OBJECT Get plain text', 'OBJECT Get pointer', 'OBJECT GET RESIZING OPTIONS',
      'OBJECT GET RGB COLORS', 'OBJECT GET SCROLL POSITION', 'OBJECT GET SCROLLBAR',
      'OBJECT GET SHORTCUT', 'OBJECT Get styled text', 'OBJECT GET STYLED TEXT ATTRIBUTES',
      'OBJECT GET SUBFORM', 'OBJECT GET SUBFORM CONTAINER SIZE', 'OBJECT Get title',
      'OBJECT Get vertical alignment', 'OBJECT Get visible', 'OBJECT MOVE', 'OBJECT SET AUTO SPELLCHECK',
      'OBJECT SET CHOICE LIST NAME', 'OBJECT SET COLOR', 'OBJECT SET DRAG AND DROP OPTIONS',
      'OBJECT SET ENABLED', 'OBJECT SET ENTERABLE', 'OBJECT SET FILTER', 'OBJECT SET FOCUS RECTANGLE INVISIBLE',
      'OBJECT SET FONT', 'OBJECT SET FONT SIZE', 'OBJECT SET FONT STYLE', 'OBJECT SET FORMAT',
      'OBJECT SET HELP TIP', 'OBJECT SET HORIZONTAL ALIGNMENT', 'OBJECT SET KEYBOARD LAYOUT',
      'OBJECT SET PLAIN TEXT', 'OBJECT SET RESIZING OPTIONS', 'OBJECT SET RGB COLORS',
      'OBJECT SET SCROLL POSITION', 'OBJECT SET SCROLLBAR', 'OBJECT SET SHORTCUT',
      'OBJECT SET STYLED TEXT', 'OBJECT SET STYLED TEXT ATTRIBUTES', 'OBJECT SET SUBFORM',
      'OBJECT SET TITLE', 'OBJECT SET VERTICAL ALIGNMENT', 'OBJECT SET VISIBLE', 'Old',
      'OLD RELATED MANY', 'OLD RELATED ONE', 'On Backup Shutdown Database Method',
      'On Backup Startup Database Method', 'On Drop database method', 'ON ERR CALL',
      'ON EVENT CALL', 'On Exit Database Method', 'On Server Close Connection Database Method',
      'On Server Open Connection Database Method', 'On Server Shutdown Database Method',
      'On Server Startup Database Method', 'On SQL Authentication Database Method',
      'On Startup Database Method', 'On System Event database method', 'On Web Authentication Database Method',
      'On Web Connection Database Method', 'On Web Session Suspend database method',
      'ONE RECORD SELECT', 'OPEN ADMINISTRATION WINDOW', 'OPEN DATA FILE', 'Open document',
      'Open external window', 'Open form window', 'OPEN PRINTING FORM', 'OPEN PRINTING JOB',
      'Open resource file', 'OPEN SECURITY CENTER', 'OPEN SETTINGS WINDOW', 'OPEN WEB URL',
      'Open window', 'ORDER BY', 'ORDER BY FORMULA', 'ORDER SUBRECORDS BY', 'Outside call',
      'PAGE BREAK', 'PAGE SETUP', 'Pasteboard data size', 'PAUSE PROCESS', 'PHP Execute',
      'PHP GET FULL RESPONSE', 'PHP GET OPTION', 'PHP SET OPTION', 'PICTURE CODEC LIST',
      'PICTURE LIBRARY LIST', 'PICTURE PROPERTIES', 'Picture size', 'PICTURE TO BLOB',
      'PICTURE TO GIF', 'PICTURE TYPE LIST', 'PLATFORM PROPERTIES', 'PLAY', 'PLUGIN LIST',
      'POP RECORD', 'Pop up menu', 'Position', 'POST CLICK', 'POST EVENT', 'POST KEY',
      'PREVIOUS RECORD', 'PREVIOUS SUBRECORD', 'Print form', 'PRINT LABEL', 'Print object',
      'PRINT OPTION VALUES', 'PRINT RECORD', 'PRINT SELECTION', 'PRINT SETTINGS',
      'PRINTERS LIST', 'Printing page', 'PROCESS 4D TAGS', 'Process aborted', 'Process number',
      'PROCESS PROPERTIES', 'Process state', 'PUSH RECORD', 'QR BLOB TO REPORT', 'QR Count columns',
      'QR DELETE COLUMN', 'QR DELETE OFFSCREEN AREA', 'QR EXECUTE COMMAND', 'QR Find column',
      'QR Get area property', 'QR GET BORDERS', 'QR Get command status', 'QR GET DESTINATION',
      'QR Get document property', 'QR Get drop column', 'QR GET HEADER AND FOOTER',
      'QR Get HTML template', 'QR GET INFO COLUMN', 'QR Get info row', 'QR Get report kind',
      'QR Get report table', 'QR GET SELECTION', 'QR GET SORTS', 'QR Get text property',
      'QR GET TOTALS DATA', 'QR GET TOTALS SPACING', 'QR INSERT COLUMN', 'QR New offscreen area',
      'QR ON COMMAND', 'QR REPORT', 'QR REPORT TO BLOB', 'QR RUN', 'QR SET AREA PROPERTY',
      'QR SET BORDERS', 'QR SET DESTINATION', 'QR SET DOCUMENT PROPERTY', 'QR SET HEADER AND FOOTER',
      'QR SET HTML TEMPLATE', 'QR SET INFO COLUMN', 'QR SET INFO ROW', 'QR SET REPORT KIND',
      'QR SET REPORT TABLE', 'QR SET SELECTION', 'QR SET SORTS', 'QR SET TEXT PROPERTY',
      'QR SET TOTALS DATA', 'QR SET TOTALS SPACING', 'QT COMPRESS PICTURE', 'QT COMPRESS PICTURE FILE',
      'QT LOAD COMPRESS PICTURE FROM FILE', 'QUERY', 'QUERY BY EXAMPLE', 'QUERY BY FORMULA',
      'QUERY BY SQL', 'QUERY SELECTION', 'QUERY SELECTION BY FORMULA', 'QUERY SELECTION WITH ARRAY',
      'QUERY SUBRECORDS', 'QUERY WITH ARRAY', 'QUIT 4D', 'Random', 'READ ONLY', 'Read only state',
      'READ PICTURE FILE', 'READ WRITE', 'REAL TO BLOB', 'RECEIVE BUFFER', 'RECEIVE PACKET',
      'RECEIVE RECORD', 'RECEIVE VARIABLE', 'Record number', 'Records in selection',
      'Records in set', 'Records in subselection', 'Records in table', 'REDRAW', 'REDRAW LIST',
      'REDRAW WINDOW', 'REDUCE SELECTION', 'REGENERATE MISSING TABLE', 'REGISTER CLIENT',
      'REJECT', 'RELATE MANY', 'RELATE MANY SELECTION', 'RELATE ONE', 'RELATE ONE SELECTION',
      'RELEASE MENU', 'RELOAD EXTERNAL DATA', 'REMOVE FROM SET', 'REMOVE PICTURE FROM LIBRARY',
      'Replace string', 'Request', 'RESIZE FORM WINDOW', 'RESOLVE ALIAS', 'RESOLVE POINTER',
      'RESOURCE LIST', 'RESOURCE TYPE LIST', 'RESTORE', 'RESUME PROCESS', 'Right click',
      'Round', 'SAVE LIST', 'SAVE PICTURE TO FILE', 'SAVE RECORD', 'SAVE RELATED ONE',
      'SAVE SET', 'SAVE VARIABLES', 'SAX ADD PROCESSING INSTRUCTION', 'SAX ADD XML CDATA',
      'SAX ADD XML COMMENT', 'SAX ADD XML DOCTYPE', 'SAX ADD XML ELEMENT VALUE', 'SAX CLOSE XML ELEMENT',
      'SAX GET XML CDATA', 'SAX GET XML COMMENT', 'SAX GET XML DOCUMENT VALUES', 'SAX GET XML ELEMENT',
      'SAX GET XML ELEMENT VALUE', 'SAX GET XML ENTITY', 'SAX Get XML node', 'SAX GET XML PROCESSING INSTRUCTION',
      'SAX OPEN XML ELEMENT', 'SAX OPEN XML ELEMENT ARRAYS', 'SAX SET XML DECLARATION',
      'SCAN INDEX', 'SCREEN COORDINATES', 'SCREEN DEPTH', 'Screen height', 'Screen width',
      'Select document', 'Select folder', 'SELECT LIST ITEMS BY POSITION', 'SELECT LIST ITEMS BY REFERENCE',
      'SELECT LOG FILE', 'Select RGB Color', 'Selected list items', 'Selected record number',
      'SELECTION RANGE TO ARRAY', 'SELECTION TO ARRAY', 'Self', 'Semaphore', 'SEND PACKET',
      'SEND RECORD', 'SEND VARIABLE', 'Sequence number', 'SET ABOUT', 'SET ALLOWED METHODS',
      'SET ASSERT ENABLED', 'SET AUTOMATIC RELATIONS', 'SET BLOB SIZE', 'SET CHANNEL',
      'SET CURRENT PRINTER', 'SET CURSOR', 'SET DATABASE LOCALIZATION', 'SET DATABASE PARAMETER',
      'SET DEFAULT CENTURY', 'SET DOCUMENT CREATOR', 'SET DOCUMENT POSITION', 'SET DOCUMENT PROPERTIES',
      'SET DOCUMENT SIZE', 'SET DOCUMENT TYPE', 'SET ENVIRONMENT VARIABLE', 'SET EXTERNAL DATA PATH',
      'SET FIELD RELATION', 'SET FIELD TITLES', 'SET FIELD VALUE NULL', 'SET FILE TO PASTEBOARD',
      'Set group properties', 'SET INDEX', 'SET LIST ITEM', 'SET LIST ITEM FONT',
      'SET LIST ITEM ICON', 'SET LIST ITEM PARAMETER', 'SET LIST ITEM PROPERTIES',
      'SET LIST PROPERTIES', 'SET MACRO PARAMETER', 'SET MENU BAR', 'SET MENU ITEM',
      'SET MENU ITEM ICON', 'SET MENU ITEM MARK', 'SET MENU ITEM METHOD', 'SET MENU ITEM PARAMETER',
      'SET MENU ITEM PROPERTY', 'SET MENU ITEM SHORTCUT', 'SET MENU ITEM STYLE', 'SET PICTURE FILE NAME',
      'SET PICTURE METADATA', 'SET PICTURE RESOURCE', 'SET PICTURE TO LIBRARY', 'SET PICTURE TO PASTEBOARD',
      'SET PLATFORM INTERFACE', 'SET PLUGIN ACCESS', 'SET PRINT MARKER', 'SET PRINT OPTION',
      'SET PRINT PREVIEW', 'SET PRINTABLE MARGIN', 'SET PROCESS VARIABLE', 'SET QUERY AND LOCK',
      'SET QUERY DESTINATION', 'SET QUERY LIMIT', 'SET REAL COMPARISON LEVEL', 'SET RESOURCE',
      'SET RESOURCE NAME', 'SET RESOURCE PROPERTIES', 'SET SCREEN DEPTH', 'SET STRING RESOURCE',
      'SET TABLE TITLES', 'SET TEXT RESOURCE', 'SET TEXT TO PASTEBOARD', 'SET TIMEOUT',
      'SET TIMER', 'Set user properties', 'SET WINDOW RECT', 'SET WINDOW TITLE', 'Shift down',
      'SHOW MENU BAR', 'SHOW ON DISK', 'SHOW PROCESS', 'SHOW TOOL BAR', 'SHOW WINDOW',
      'Sin', 'Size of array', 'SOAP DECLARATION', 'SOAP Get info', 'SOAP Request',
      'SOAP SEND FAULT', 'SORT ARRAY', 'SORT LIST', 'SPELL ADD TO USER DICTIONARY',
      'SPELL CHECK TEXT', 'SPELL CHECKING', 'SPELL Get current dictionary', 'SPELL GET DICTIONARY LIST',
      'SPELL SET CURRENT DICTIONARY', 'SQL CANCEL LOAD', 'SQL End selection', 'SQL EXECUTE',
      'SQL EXECUTE SCRIPT', 'SQL EXPORT DATABASE', 'SQL EXPORT SELECTION', 'SQL GET LAST ERROR',
      'SQL GET OPTION', 'SQL LOAD RECORD', 'SQL LOGIN', 'SQL LOGOUT', 'SQL SET OPTION',
      'SQL SET PARAMETER', 'Square root', 'START SQL SERVER', 'START TRANSACTION',
      'Std deviation', 'STOP SQL SERVER', 'String', 'STRING LIST TO ARRAY', 'Structure file',
      'Substring', 'Subtotal', 'Sum', 'Sum squares', 'SVG EXPORT TO PICTURE', 'SVG Find element ID by coordinates',
      'SVG Find element IDs by rect', 'SVG GET ATTRIBUTE', 'SVG SET ATTRIBUTE', 'SVG SHOW ELEMENT',
      'System folder', 'Table', 'Table name', 'Tan', 'Temporary folder', 'Test path name',
      'Test semaphore', 'TEXT TO ARRAY', 'TEXT TO BLOB', 'Tickcount', 'Time', 'Time string',
      'Tool bar height', 'TRACE', 'Transaction level', 'TRANSFORM PICTURE', 'Trigger event',
      'Trigger level', 'TRIGGER PROPERTIES', 'True', 'Trunc', 'TRUNCATE TABLE', 'Type',
      'Undefined', 'UNION', 'UNLOAD RECORD', 'UNREGISTER CLIENT', 'Uppercase', 'USE CHARACTER SET',
      'USE EXTERNAL DATABASE', 'USE INTERNAL DATABASE', 'USE NAMED SELECTION', 'USE SET',
      'User in group', 'USERS TO BLOB', 'Validate password', 'VALIDATE TRANSACTION',
      'VARIABLE TO BLOB', 'VARIABLE TO VARIABLE', 'Variance', 'VERIFY CURRENT DATA FILE',
      'VERIFY DATA FILE', 'Version type', 'VOLUME ATTRIBUTES', 'VOLUME LIST', 'WA Back URL available',
      'WA Create URL history menu', 'WA Execute JavaScript', 'WA EXECUTE JAVASCRIPT FUNCTION',
      'WA Forward URL available', 'WA Get current URL', 'WA GET EXTERNAL LINKS FILTERS',
      'WA Get last filtered URL', 'WA GET LAST URL ERROR', 'WA Get page content',
      'WA Get page title', 'WA GET PREFERENCE', 'WA GET URL FILTERS', 'WA GET URL HISTORY',
      'WA OPEN BACK URL', 'WA OPEN FORWARD URL', 'WA OPEN URL', 'WA REFRESH CURRENT URL',
      'WA SET EXTERNAL LINKS FILTERS', 'WA SET PAGE CONTENT', 'WA SET PAGE TEXT LARGER',
      'WA SET PAGE TEXT SMALLER', 'WA SET PREFERENCE', 'WA SET URL FILTERS', 'WA STOP LOADING URL',
      'WEB CLOSE SESSION', 'WEB GET BODY PART', 'WEB Get body part count', 'WEB Get Current Session ID',
      'WEB GET HTTP BODY', 'WEB GET HTTP HEADER', 'WEB GET OPTION', 'WEB GET SESSION EXPIRATION',
      'WEB GET STATISTICS', 'WEB GET VARIABLES', 'WEB Is secured connection', 'WEB SEND BLOB',
      'WEB SEND FILE', 'WEB SEND HTTP REDIRECT', 'WEB SEND RAW DATA', 'WEB SEND TEXT',
      'WEB SERVICE AUTHENTICATE', 'WEB SERVICE CALL', 'WEB SERVICE Get error info',
      'WEB SERVICE GET RESULT', 'WEB SERVICE SET OPTION', 'WEB SERVICE SET PARAMETER',
      'WEB SET HOME PAGE', 'WEB SET HTTP HEADER', 'WEB SET OPTION', 'WEB SET ROOT FOLDER',
      'WEB START SERVER', 'WEB STOP SERVER', 'WEB Validate digest', 'Win to Mac',
      'Window kind', 'WINDOW LIST', 'Window process', 'Windows Alt down', 'Windows Ctrl down',
      'WRITE PICTURE FILE', 'XML DECODE', 'XML GET ERROR', 'XML GET OPTIONS', 'XML SET OPTIONS',
      'XSLT APPLY TRANSFORMATION', 'XSLT GET ERROR', 'XSLT SET PARAMETER', 'Year of',
      '_o_SET CGI EXECUTABLE', '_o_SET WEB DISPLAY LIMITS', '_o_SET WEB TIMEOUT',
      '_o_Web Context'
    ];

    FOURD_CONSTANTS = [];

    FOURD_KEYWORDS = [
      'If', 'Else', 'End if',
      'Case of', 'End case',
      'While', 'End while',
      'Repeat', 'Until',
      'For', 'End for'
    ];

    // Convenience lookup objects, it'll be faster to use
    // `Object.hasOwnProperty` than `Array.indexOf`. These are also normalized
    // so we're only ever looking for *lowercase* versions of things
    (function() {
      var ix;
      for(ix = FOURD_COMMANDS.length; ix--;) {
        FOURD_COMMANDS_HASH[FOURD_COMMANDS[ix].toLowerCase()] = FOURD_COMMANDS[ix];
      }
      for(ix = FOURD_CONSTANTS.length; ix--;) {
        FOURD_CONSTANTS_HASH[FOURD_CONSTANTS[ix].toLowerCase()] = FOURD_CONSTANTS[ix];
      }
      for(ix = FOURD_KEYWORDS.length; ix--;) {
        FOURD_KEYWORDS_HASH[FOURD_KEYWORDS[ix].toLowerCase()] = FOURD_KEYWORDS[ix];
      }
    }());

  };
}());

