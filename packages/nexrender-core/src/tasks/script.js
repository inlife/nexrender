const fs     = require('fs')
const path   = require('path')
const script = require('../assets/nexrender.jsx')
const matchAll = require('match-all')
const { checkForWSL } = require('../helpers/path')

/* helpers */
const escape = str => {
    str = JSON.stringify(str)
    str = str.substring(1, str.length-1)
    str = `'${str.replace(/\'/g, '\\\'')}'`
    return str
}

const selectLayers = ({ composition, layerName, layerIndex }, callbackString) => {
    const method = layerName ? 'selectLayersByName' : 'selectLayersByIndex';
    const compo  = composition === undefined ? 'null' : escape(composition);
    const value  = layerName ? escape(layerName) : layerIndex;

    return (`nexrender.${method}(${compo}, ${value}, ${callbackString});`);
}

const renderIf = (value, string) => {
    const encoded = typeof value == 'string' ? escape(value) : JSON.stringify(value);
    return value === undefined ? '' : string.replace('$value', () => encoded);
}

const partsOfKeypath = (keypath) => {
    var parts = keypath.split('->');
    return (parts.length === 1) ? keypath.split('.') : parts
}

/* scripting wrappers */
const wrapFootage = ({ dest, ...asset }, settings) => (`(function() {
    ${selectLayers(asset, `function(layer) {
        nexrender.replaceFootage(layer, '${checkForWSL(dest.replace(/\\/g, "\\\\"), settings)}')
    }`)}
})();\n`)

const wrapData = ({ property, value, expression, ...asset }) => (`(function() {
    ${selectLayers(asset, /* syntax:js */`function(layer) {

        var parts = ${JSON.stringify(partsOfKeypath(property))};
        ${renderIf(value, `var value = { "value": $value }`)}
        ${renderIf(expression, `var value = { "expression": $value }`)}
        nexrender.changeValueForKeypath(layer, parts, value);

        return true;
    }`)}
})();\n`)

// @deprecated in favor of wrapEnhancedScript (implementation below)
const wrapScript = ({ dest }) => (`(function() {
    ${fs.readFileSync(dest, 'utf8')}
})();\n`)


/*
    Wrap Enhanced Script
    ====================
    @author Dilip Ramírez (https://github.com/dukuo | https://notimetoexplain.co)
    @autor Based on the work of Potat (https://github.com/dukuo/potat)
    @description        Parse a script from a source, and injects a configuration object named ${keyword} based on the "parameters" array of the script asset if any.

                        If parameters or functions deriving from the configuration object are being used in the script, but no parameters are set, then it succeeds but
                        displays a warning with the missing JSX/JSON matches, and sets all the missing ones to null for a soft fault tolerance at runtime.

    @param src                 The JSX script
    @param parameters          (Array<Object>)  Argument array described in the Asset JSON object inside the Job description
    @param keyword             (String)         Name for the exported variable holding configuration parameters. Defaults to NX as in NeXrender.
    @param defaults.null  (Any)            The default value in case the user setted key name on any given `parameter` child object. Defaults to `null`

    @return string             (String)         The compiled script with parameter injection outside its original scope to avoid user-defined defaults collision.
*/
const wrapEnhancedScript = ({ dest, src, parameters = [], keyword, defaults,  ...asset }, jobID, settings) => {

    function EnhancedScript (
            dest,
            src,
            parameters          = [],
            keyword             = "NX",
            defaults            = {
                global : "null",
                string : "",
                number: 0,
                array: [],
                boolean: false,
                object: {},
                function : function (){},
                null: null
            },
            jobID,
            logger
    ) {
        this.scriptPath         = src;
        this.script             = fs.readFileSync(dest, 'utf8');
        this.keyword            = keyword;
        this.defaults           = defaults;
        this.jobID              = jobID;
        this.logger             = logger;
        this.jsonParameters     = parameters;

        this.regexes            = {
            keywordUsage: null,
            keywordInit: null,
            fnDetect: null
        };

        this.missingJSONParams  = [];



        // Setup
        this.setupRegexes();

    }

    /*
    * Utilities, one-liners
    */

    EnhancedScript.prototype.getScriptPath = function()             { return this.scriptPath; }

    EnhancedScript.prototype.getGetterMethod = function ()          { return "get"; }

    EnhancedScript.prototype.getSetterMethod = function ()          { return "set"; }

    EnhancedScript.prototype.getLogger = function ()                { return this.logger; }

    EnhancedScript.prototype.getJSXScript = function ()             { return this.script; }

    EnhancedScript.prototype.getJSONParams = function ()            { return this.jsonParameters; }

    EnhancedScript.prototype.jsonParametersCount = function ()      { return this.jsonParameters.length; }

    EnhancedScript.prototype.getMissingJSONParams = function()      { return this.missingJSONParams; }

    EnhancedScript.prototype.countMissingJSONParams = function()    { return this.getMissingJSONParams().length; }

    EnhancedScript.prototype.getKeyword = function ()               { return this.keyword; }

    EnhancedScript.prototype.getFnArgsKeyword = function ()         { return this.fnArgsKeyword; }

    EnhancedScript.prototype.getRegex = function (key)              { return this.regexes[key]; }


    /*
            Get Default Value
            @description                Retrieves a default value parameter based on a key.
            @param key                  (String)("string"|"number"|"array"|"object"|"null"|"function") The key to the required default parameter. Defaults to "null".
            @returns default            The value from this.defaults array.
        */
    EnhancedScript.prototype.getDefaultValue = function (key)   { return key in this.defaults ? this.defaults[key] : this.defaults[this.defaults.global]; }

    /*
        Add Missing JSON Parameter
        =====================
        @description                Adds an object with the key of a parameter being used in JSX code but with no default in the JSON Asset.
        @param nxMatch              (Object) The object to add to the missing array.
                                    Required format:
                                    {
                                        key: string
                                        isVar: boolean
                                        isFn: boolean
                                        needsDefault: boolean.
                                    }
        @returns object             The recently added object.
    */
    EnhancedScript.prototype.addToMissingJsonParameter = function (nxMatch)   { return this.missingJSONParams.push(nxMatch); }

    /*
    * End one-liners
    */

    EnhancedScript.prototype.setupRegexes = function ()         {

        this.regexes.searchUsageByMethod = (method = "set", flags = "g") => {
            const str = `(?<!(?:[\\/\\s]))(?<!(?:[\\*\\s]))(?:\\s*${this.getKeyword()}\\s*\\.)\\s*(${method})\\s*(?:\\()(?:["']{1})([a-zA-Z0-9._-]+)(?:["']{1})(?:\\))`;
            return this.buildRegex(str, flags);
        }

        // Find instances of a function inside a single-line string.
        this.regexes.fnDetect = new RegExp(/(?:(?:(?:function *(?:[a-zA-Z0-9_]+)?) *(?:\((?:.*)\)) *(?:\{(?:.*)\}))|(?:(?:.*) *(?:=>) *(?:\{)(?:.*?)?\}))/);


        // This regex will detect a self-invoking function like (function(){})() and will catch the invoking parameters in a single string for further inspection.
        this.regexes.selfInvokingFn = new RegExp(/(?:(?:^\() *(?:.*?)(?:} *\)))(?: *(?:\() *(.*?) *(?:\) *$))/);
    }

    EnhancedScript.prototype.escapeForRegex = function (str)    {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    EnhancedScript.prototype.stripComments = function (templateLiteral)               {
        return templateLiteral.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
    }

    EnhancedScript.prototype.buildRegex = function(templateLiteral, flags)            {
        return new RegExp(this.stripComments(templateLiteral).replace(/(\r\n|r\|\n|\s)/gm, ''), flags);
    }

    /*
        Parse method from parameter
        @description                    Given a parameter detect whether it should be casted as a function in the final argument injection.
        @param param                (string|number|boolean|null|object|array) The parameter to parse a method from.
        @return bool                (Boolean) If a method is detected then it's stripped from String quotes, else it's returned in it's original type.
    */

    EnhancedScript.prototype.isMethod = function (param)                    {
        if(typeof param == "string") {
            return (param.match(this.getRegex("fnDetect")) ? true : false);
        }
        return false
    }

    EnhancedScript.prototype.parseMethod = function (parameter)             {
        const selfInvokingFn = matchAll(parameter.value, this.getRegex('selfInvokingFn'));
        if ( selfInvokingFn ) {
            this.getLogger().log(Array.from(selfInvokingFn));
            return this.parseMethodWithArgs(parameter);
        }
        return parameter.value;
    }

    EnhancedScript.prototype.matchAsJSONParameterKey = function ( key )     {
        const parameterMatch = this.getJSONParams().find(o => o.key == key);

        return parameterMatch ? parameterMatch.value : key;
    }

    EnhancedScript.prototype.parseMethodWithArgs = function (parameter)     {
        let value = parameter.value;

        const methodArgs = matchAll(parameter.value, this.getRegex('searchUsageByMethod')('arg', "gm")).toArray();

        if( methodArgs.length > 0 ) {

            this.getLogger().log("We found a self-invoking method with arguments!");
            this.getLogger().log(JSON.stringify(methodArgs));
            const foundArgument = methodArgs.filter( argMatch => {
                [fullMatch, method, arg] = argMatch;

                return parameter.arguments && parameter.arguments.find(o => o.key == arg);
            });


            if( foundArgument ) {
                // Search if argument is present in JSON and has `arguments` array to match against the results.
                // And do a replacement with either the found argument on the array or a global default value.

                let argReplacement = parameter.arguments && parameter.arguments.find(o => o.key == arg).value || this.getStringifiedDefaultValue(this.defaults.global);

                const fullMatchRegex = this.buildRegex(this.escapeForRegex(fullMatch), "gm");

                value = parameter.value.replace(fullMatchRegex, argReplacement);
            }
        }

        return value;
    }

    EnhancedScript.prototype.detectValueType = function (parameter)               {
        return this.isMethod(parameter.value) ? this.parseMethod(parameter) : JSON.stringify(parameter.value);
    }

    /*
        Get Default Value as String
        @description                Retrieves a default value parameter based on a key.
        @param key                  (String)("string"|"number"|"array"|"object"|"null"|"function") The key to the required default parameter. Defaults to "null".
        @returns default            (String) A template literal string with the embedded default parameter. If it's a string then it's wrapped with quotes.
    */
    EnhancedScript.prototype.getStringifiedDefaultValue = function (key)            {
        return JSON.stringify(this.getDefaultValue(key))
    }

    /*
        Strip comment blocks from Script [EXPERIMENTAL]
        ================================
        @description                Removes /* * / comments  from script to avoid mismatching occurrences.
        @param script               (String)            The target script to strip.
        @returns string             (String)            A one-line version of the original script without comment blocks.
    */

    EnhancedScript.prototype.stripCommentsFromScript = function (script)             {
        // https://levelup.gitconnected.com/advanced-regex-find-and-remove-multi-line-comments-in-your-code-c162ba6e5811
        return script
            .replace(/\n/g, " ")
            .replace(/\/\*.*\*\//g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    /*
    * End Utilities
    */

    /*
        Find Missing Matches in JSX Script
        ====================
        @description                RegEx Searches a given JSX script to find occurences and saves an object with keys
        @param script               (String)            JSX script to find occurences in.
        @param regex                (Object)            RegEx object to match against JSX script.
        @param parameters           (Array<Object>)     Array with the parameters to compare against the matches.
        @return bool                (Boolean)           Whether or not there are any variables to inject. Defaults to false.
    */

    EnhancedScript.prototype.findMissingMatchesInJSX = function ()                         {

        const script = this.stripCommentsFromScript(this.getJSXScript());

        // Parse all occurrences of the usage of NX on the provided script.

        const nxMatches = matchAll(script, this.getRegex("searchUsageByMethod")("get", "gm")).toArray();

        if (nxMatches && nxMatches.length > 0 ) {

            nxMatches.forEach( match => {
                const [fullMatch, method, keyword] = match;

                var nxMatch = {
                    key: keyword.replace(/\s/g, ''),
                    isVar: false,
                    isFn: false,
                    value: this.getDefaultValue(match.default ? match.default : this.defaults.global)
                };
                if ( this.getJSONParams().filter( o => o.key == nxMatch.key ).length == 0) { // If the parameter doesn't have a value defined in JSON
                    this.addToMissingJsonParameter(nxMatch);
                }

            });
        }
        const missingJSONParameters = this.countMissingJSONParams();
        if( missingJSONParameters > 0) {
            this.getLogger().log(`[${jobID}] ${this.displayAlert()}`);
        }
        return missingJSONParameters > 0;
    }


    /*
        Generated Placeholder Parameters
        ================================
        @description            Generates placeholder for "parameters" JSON Object based on keys from an array.
        @param keys             (Array)     Array of strings. These should be the occurences of `keyword` variable use on the JSX script.

        @return string          (String)    JSON "parameters" object.
      */
     EnhancedScript.prototype.generatePlaceholderParameters = function ( ) {
        const missingParams = this.getMissingJSONParams();

        const template = (key) => `
                {
                    "key" : "${key}",
                    "value" : ${this.getStringifiedDefaultValue(this.defaults.global)}
                }\n
        `;

        return `
            "parameters" : [
                ${missingParams.map((k, i) => template(k.key)).join("\n")}
            ]
        `
    }

    /*
        Display Missing Alert
        =====================
        @description              Display a log message if theres any missing parameter set on the JSON configuration but is being referred in the script.

        @param missingParam      (Object)   Missing Parameters object. See below for its construction. Must have child objects `fn` and `vars`
        @param showJSXWarning    (Boolean)  Flag for whether or not to display warning about not initializing variable in JSX script. Defaults to false.
        @param injectionVar      (String)   Variable initialized with placeholder values. Defaults to "".

        @return string           (String)   The template literal string displaying all the occurences if any.
    */
    EnhancedScript.prototype.displayAlert = function ()                             {
        const keyword            = this.getKeyword();

        return ` -- W A R N I N G --
        The following parameters used in the script were NOT found on the JSON "parameters" object of your script asset ${this.getScriptPath() }

            ${this.getMissingJSONParams().map(o => o.key).join(", ")}

        Please set defaults in your JSX script (see documentation) or copy the following placeholder JSON code snippet and replace the values with your own:

        ${this.generatePlaceholderParameters()}

        Remember to always use a fallback default value for any use of the ${keyword} object to have the ability to run this script on After Effects directly.
        Example:
            const dogName = ${keyword} && ${keyword}.${this.getGetterMethod()}("doggo") || "Doggo";
        `
    }

    EnhancedScript.prototype.injectParameters = function ()                         {
        return [...this.getJSONParams(), ...this.getMissingJSONParams()].map( param => {
            let value = param.type ? this.getStringifiedDefaultValue(param.type) : this.getDefaultValue(this.defaults.global);

            if( param.value ) {
                value = this.detectValueType(param);
            }

            return `${this.getKeyword()}.${this.getSetterMethod()}('${param.key}', ${value});`
        }).join("\n");
    }

    EnhancedScript.prototype.buildParameterConfigurator = function ()               {

        const defaultGlobalValue = this.getStringifiedDefaultValue( this.defaults.global );
        const defaultFnValue = this.getDefaultValue( this.defaults.function );
        const createParameterConfigurator = () => `
    function ParameterConfigurator () {
        this.params = [];
    }

    ParameterConfigurator.prototype.set = function (k, v) {
        this.params.push({
            key: k,
            value: v
        });
    };

    ParameterConfigurator.prototype.call = function ( key, args ) {
        for (var i = 0; i < this.params.length; i++) {
            if (this.params[i].key == key) {
                if (typeof this.params[i].value == "function") return this.params[i].value.apply(this, args && args.length > 0 ? args : []);
            }
        }
        return null;
    }

    ParameterConfigurator.prototype.get = function ( key, args ) {
        for (var i = 0; i < this.params.length; i++) {
            if (this.params[i].key == key) {
                if(typeof this.params[i].value == "function") return this.call(key, args || []);
                return this.params[i].value;
            };
        }
        return ${ defaultGlobalValue }
    };
    var ${ this.getKeyword() } = new ParameterConfigurator();

    // Parameter injection from job configuration
    ${ this.injectParameters() }
`;

        return createParameterConfigurator();
    }

    EnhancedScript.prototype.build = function ()                                    {
        this.findMissingMatchesInJSX();

        // Et voilà!
        const enhancedScript = `(function() {
    ${this.buildParameterConfigurator()}
    ${this.getJSXScript()}
    })();\n`;
        // do not log the script (can be uncommented for debugging)
        // this.getLogger().log(enhancedScript);

        return enhancedScript;
    }

    const enhancedScript = new EnhancedScript(dest, src, parameters, keyword, defaults, jobID, settings.logger);

    return enhancedScript.build();
}

module.exports = (job, settings) => {
    settings.logger.log(`[${job.uid}] running script assemble...`);

    const data = [];
    const base = job.workpath;

    job.assets.map(asset => {
        switch (asset.type) {
            case 'video':
            case 'audio':
            case 'image':
                data.push(wrapFootage(asset, settings));
                break;

            case 'data':
                data.push(wrapData(asset));
                break;

            case 'script':
                data.push(wrapEnhancedScript(asset, job.uid, settings));
                break;
        }
    });

    /* write out assembled custom script file in the workpath */
    job.scriptfile = path.join(base, `nexrender-${job.uid}-script.jsx`);
    fs.writeFileSync(job.scriptfile, script
        .replace('/*COMPOSITION*/', job.template.composition)
        .replace('/*USERSCRIPT*/', () => data.join('\n'))
    );

    return Promise.resolve(job)
}
