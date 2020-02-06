const fs     = require('fs')
const path   = require('path')
const script = require('../assets/nexrender.jsx')

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
const wrapFootage = ({ dest, ...asset }) => (`(function() {
    ${selectLayers(asset, `function(layer) {
        nexrender.replaceFootage(layer, '${dest.replace(/\\/g, "\\\\")}')
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
    @description        Parse a script from a source, and injects a configuration object named ${keyword} based on the "parameters" array of the script asset if any.

                        If parameters or functions deriving from the configuration object are being used in the script, but no parameters are set, then it succeeds but
                        displays a warning with the missing JSX/JSON matches, and sets all the missing ones to null for a soft fault tolerance at runtime.

                        Example JSON asset declaration:

                        "assets": [
                            {
                                "src": "file:///C:/sample/sampleParamInjection.jsx",
                                "type": "script",
                                "parameters": [
                                    {
                                        "key": "name",
                                        "value": "Dilip"
                                    }
                                ]
                            }
                        ]

                         Each parameter object should have the following:
                        * **key** (required)    :   The key of the variable. Example: Key = dog => NX.dog.
                        * **value** (required)  :   The target value for the variable. Example: Key = dog, Value = "doggo" => NX.dog = "doggo"

                        The `value` could be a variable or a function, but beware that there is no sanitization nor validation so **if the input is malformed it could crash the job**

                        By default ${keyword} = "NX", so you would use a dynamic variable like NX.name or a function like NX.something(). To change this keyword simply
                        set "keyword" as shown below:

                        "assets": [
                            {
                                "src": "file:///C:/sample/sampleParamInjection.jsx",
                                "type": "script",
                                "keyword": "_settings",
                                "parameters": [
                                    {
                                        "key": "name",
                                        "value": "Dilip"
                                    }
                                ]
                            }
                        ]

                        That way instead of NX.name it would be _settings.name

                        All dynamic parameters used in the script should have a JSX default by stating a local ${keyword} variable like on the example below.

                        Example JSX Script with defaults:

                        {
                            var NX = NX || { name : "John" }; // Setting default variables.

                            return "Hello " + NX.name;
                        }

                        The code above will output either:
                        a) "Hello John" if no parameter defined on the JSON "parameters" array.
                        b) "Hello NAME" if parameter "name" has a "value" of NAME on the JSON "parameters" array.

                        Example JSX Script without defaults:

                        {
                            return "There are " + NX.beerBottlesAmount + " beer bottles ready to drink!"
                        }

                        The code above will output either:
                        a) "There are null beer bottles ready to drink!" if no parameter defined on the JSON Asset "parameters" array.
                        b) "There are X beer bottles ready to drink!" if parameter "beerBottlesAmount" has a "value" of X on the JSON Asset "parameters" array.

                        An example of a compiled script without JSON nor JSX initialization (auto generated null values) would look like the following ( minus the comments )

                        ```
                        (function() {
                            // Generated based on the parameters on the script, with no JSON parameters initialization and no local variable defined.
                            var NX = {"name":"null"};

                            // Original script from jsx file. Pretty much the same as the behaviour before my PR.

                            // Note that this can, and most positively will, crash if executed directly in After Effects. With a local definition of the variable and default
                            // parameters this would be fixed.
                            {
                                // Example of local definition:
                                // var NX = NX || { name : "John" };
                                alert("Hello " + NX.name);
                            }
                            // End of jsx script
                        })();
                        ```

    @param src                 The JSX script
    @param parameters          (Array<Object>)  Argument array described in the Asset JSON object inside the Job description
    @param keyword             (String)         Name for the exported variable holding configuration parameters. Defaults to NX as in NeXrender.
    @param defaults.null  (Any)            The default value in case the user setted key name on any given `parameter` child object. Defaults to `null`

    @return string             (String)         The compiled script with parameter injection outside its original scope to avoid user-defined defaults collision.
*/
const wrapEnhancedScript = ({ dest, parameters = [], keyword, fnArgsKeyword, defaults,  ...asset }, jobID, settings) => {

    function EnhancedScript (
            dest, 
            parameters          = [],
            keyword             = "NX", 
            fnArgsKeyword       = "NX",
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
        this.script             = fs.readFileSync(dest, 'utf8');
        this.keyword            = keyword;
        this.fnArgsKeyword      = fnArgsKeyword +  "Args";
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
        
        console.log(arguments);


        // Setup
        this.setupRegexes();

    }

    /*
    * Utilities, one-liners
    */

    EnhancedScript.prototype.getGetterMethod = function ()       { return "get"; }

    EnhancedScript.prototype.getSetterMethod = function ()       { return "set"; }

    EnhancedScript.prototype.getLogger = function ()            { return this.logger; }

    EnhancedScript.prototype.getJSXScript = function ()         { return this.script; }

    EnhancedScript.prototype.getJSONParams = function ()        { return this.jsonParameters; }

    EnhancedScript.prototype.jsonParametersCount = function ()  { return this.jsonParameters.length; }

    EnhancedScript.prototype.getMissingJSONParams = function()  { return this.missingJSONParams; }

    EnhancedScript.prototype.getKeyword = function ()           { return this.keyword; }

    EnhancedScript.prototype.getFnArgsKeyword = function ()     { return this.fnArgsKeyword; }

    EnhancedScript.prototype.getRegex = function (key)          { return this.regexes[key]; }

    
    /*
            Get Default Value
            @description                Retrieves a default value parameter based on a key. 
            @param key                  (String)("string"|"number"|"array"|"object"|"null"|"function") The key to the required default parameter. Defaults to "null".
            @returns default            The value from this.defaults array.
        */
    EnhancedScript.prototype.getDefaultValue = function (key)   { return this.defaults[key]; }

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
    EnhancedScript.prototype.addMissingJsonParameter = function (nxMatch)   { return missingJSONParams.push(nxMatch); }

    /*
    * End one-liners
    */

    EnhancedScript.prototype.setupRegexes = function ()         {

        const buildGetUsageFinder = (keyword, flags = "g") => {
            return new RegExp(`/(?<!(?:[\\/ ]))(?<!(?:[\\* ]))(?: *${keyword}.) *([a-zA-Z0-9_]+) *(?:\\()(?:["']{1})([a-zA-Z0-9._-]+)(?:["']{1})(?:\\))/`, flags);
        }

        // This regex matches any occurence of the `this.keyword` usage, except on comments to avoid misinterpretation of code.
        this.regexes.keywordUsage = buildGetUsageFinder(this.getKeyword(), "gm");

        this.regexes.fnArgs = buildGetUsageFinder(this.getFnArgsKeyword(), "g");

        // Regex to find a local scoped instance of `this.keyword` in the JSX script, to avoid overriding local defaults with null values.
        // this.regexes.keywordInit = new RegExp(`(?<!(?:[\\/ ]))(?<!(?:[\\* ]))(?:[ ]){0,}?(var|const|let) ${this.getKeyword() }`, "gm");

        // Find instances of a function inside a single-line string.
        this.regexes.fnDetect = new RegExp(/(?:(?:(?:function *(?:[a-zA-Z0-9_]+)?) *(?:\((?:.*)\)) *(?:\{(?:.*)\}))|(?:(?:.*) *(?:=>) *(?:\{)(?:.*?)?\}))/);


        // This regex will detect a self-invoking function like (function(){})() and will catch the invoking parameters in a single string for further inspection.
        this.regexes.selfInvokingFn = new RegExp(/(?:(?:^\() *(?:.*?)(?:} *\)))(?: *(?:\() *(.*?) *(?:\) *$))/);


    }
    
    /*
        Generated Placeholder Parameters
        ================================
        @description            Generates placeholder for "parameters" JSON Object based on keys from an array.
        @param keys             (Array)     Array of strings. These should be the occurences of `keyword` variable use on the JSX script.

        @return string          (String)    JSON "parameters" object.
    */
    EnhancedScript.prototype.generatedPlaceholderParameters = function ( keys = [] ) {
        const template = (key) => `
                {
                    ${key}  :   "${this.getDefaultValueAsString(this.defaults.global)}"
                }\n
        `;

        return `
            "parameters" : [
                ${keys.map((k, i) => `${template(k)}${keys.length - 1 != i ? "," : ""}`).join('')}
            ]
        `
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
        const selfInvokingFn = parameter.value.matchAll(this.getRegex('selfInvokingFn'));
        if ( selfInvokingFn ) {
            return this.parseMethodWithArgs(parameter);
        }
        return parameter.value;
    }

    EnhancedScript.prototype.matchAsJSONParameterKey = function ( key )     {
        const parameterMatch = this.getJSONParams().find(o => o.key == key);
        
        return parameterMatch ? parameterMatch.value : key;
    }

    EnhancedScript.prototype.parseMethodWithArgs = function (parameter)     {
        const methodArgs = Array.from(parameter.value.matchAll(this.getRegex('fnArgs')));

        if( methodArgs ) {
            methodArgs.forEach( argMatch => {
                [fullMatch, method, arg] = argMatch;
                
                // Search if argument is present in JSON and has `arguments` array to match against the results.
                // And do a replacement with either the found argument on the array or a global default value.

                let argReplacement = this.getDefaultValueAsString(this.defaults.global);
                if (parameter.arguments && parameter.arguments[arg]) {
                    if(parameters.arguments[arg].value) {
                        argReplacement = this.matchAsJSONParameterKey(parameters.arguments[arg].value);
                    } else {
                        argReplacement = parameters.arguments[arg].default;
                    }
                }
                
                parameter.value.replace(fullMatch, argReplacement);
            });
        }
        
        return parameter;
    }

    EnhancedScript.prototype.detectValueType = function (parameter)               {
        return this.isMethod(parameter.value) ? this.parseMethod(parameter) : JSON.parse(parameter.value);
    }

    /*
            Get Default Value as String
            @description                Retrieves a default value parameter based on a key. 
            @param key                  (String)("string"|"number"|"array"|"object"|"null"|"function") The key to the required default parameter. Defaults to "null".
            @returns default            (String) A template literal string with the embedded default parameter. If it's a string then it's wrapped with quotes.
        */
       EnhancedScript.prototype.getDefaultValueAsString = function (key)            {
        const value = this.getDefaultValue(key);
        return key.toLowerCase() == "string" ? `"${value}"` : `${value}`;
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

    EnhancedScript.prototype.findMatchesInJSX = function ()                         {

        const script = this.stripCommentsFromScript(this.getJSXScript());
    
        // Parse all occurrences of the usage of NX on the provided script.
        // const nxMatches = Array.from(script.matchAll(regex)); // String.matchAll is available from Node version 12.0.0
        const nxMatches = script.match(this.getRegex("keywordUsage")); 

        const missing = [];
        
        if (nxMatches && nxMatches.length > 0 ) {
            // Since the current regex catches ocurrences like NX.call() as `NX.call(` we split the matches as either functions or variables for further debugging.
            nxMatches.forEach( match => {
                // var nxMatch = nxMatches[Object.keys(nxMatches)[i]][2]; // String.matchAll is available from Node version 12.0.0
                var nxMatch = {
                    key: match.replace(" ", '').substr(keyword.length + 1),
                    isVar: false,
                    isFn: false
                };
                if ( this.getJSONParams().filter(o => o.key == nxMatch.key.replace("(", "") ).length == 1) { // If the parameter has a value defined in JSON
                    if(nxMatch.slice(-1) == "(") { // Flag it as method call
                        nxMatch.key = nxMatch.key.replace("(", "");
                        nxMatch.isFn = true;
                    } else { // Flag it as variable/object
                        nxMatch.isVar = true;
                    }
                } else {
                    this.addMissingJsonParameter(nxMatch);
                }

                missing.push(nxMatch);
            });

            if(missing.filter( o => o.needsDefault ).length > 0) {
                logger.log(`[${jobID}] ${this.displayAlert()}`);
            }
        }
        return missing > 0;
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
        const missingParams      = this.getMissingJSONParams();

        const missingMethodCalls = missingParams.filter(o => o.isFn);
        const missingVars        = missingParams.filter(o => o.isVar);

        const keyword            = this.getKeyword();

        return ` -- W A R N I N G --
        The following ${missingVars.length > 0 ? 'variables ' : "" }${missingVars.length > 0 && missingMethodCalls.length > 0 ? 'and ' : "" }${missingMethodCalls.length > 0 ? 'method calls ' : "" }on the script are not defined in the Asset JSON configuration:
        ${areFnMissing ? `Functions: ${missingMethodCalls.map(o => o.key ).join(",")}` : ""}
        ${areVarsMissing ? `Variables: ${missingVars.map( o => o.key ).join(",")}` : ""}

        Please set defaults in your JSX script (see documentation) or copy the following placeholder JSON code snippet and replace the value with your own:

        ${this.generatedPlaceholderParameters(missingParams)}

        Remember to always use a fallback default value for any use of the ${keyword} object to have the ability to run this script on After Effects directly. 
        Example:
            const dogName = ${keyword} && ${keyword}.get("Doggo") || "Doggo";
        `
    }

    EnhancedScript.prototype.injectParameters = function ()                         {
        return [...this.getJSONParams(), ...this.getMissingJSONParams()].map( param => {
            const value = this.detectValueType(param);

            return `${this.getKeyword()}.${this.getSetterMethod()}('${key}', ${value});`
        }).join("\n");
    }

    EnhancedScript.prototype.buildParameterConfigurator = function ()               {
        console.log(`KEYWORD: ${this.getKeyword()}`);
        const defaultGlobalValue = this.getDefaultValueAsString( this.defaults.global );
        const defaultFnValue = this.getDefaultValue( this.defaults.function );
        const createParameterConfigurator = () => `
    function ParameterConfigurator () {
        this.params = [];
    }
    ParameterConfigurator.prototype.get = function ( key ) {
        for (var i = 0; i < this.params.length; i++) {
            if (this.params[i].key == key) return this.params[i];
        }
        return {
            key: ${ defaultGlobalValue },
            value: ${ defaultGlobalValue },
            exec: ${ defaultFnValue }
            
        }
    };
    ParameterConfigurator.prototype.set = function (k, v) {
        if( typeof v == "function" ) {
            var exec = v;
        } else {
            var exec = null;
        }
        this.params.push({
            key: k,
            value: v,
            exec: exec
        });
    };
    var ${ this.getKeyword() } = new ParameterConfigurator();

    // Parameter injection from job configuration
    ${ this.injectParameters() }
`;

        return createParameterConfigurator();
    }

    EnhancedScript.prototype.build = function ()                                    {
        this.findMatchesInJSX();
        
        // Et voilà!
        const enhancedScript = `(function() {
    ${this.buildParameterConfigurator()}
    ${this.getJSXScript()}
})();\n`;
        // console.log(this.getLogger());
        this.getLogger().log(enhancedScript);

        return enhancedScript;
    }


    const enhancedScript = new EnhancedScript(dest, parameters, keyword, fnArgsKeyword, defaults, jobID, settings.logger);

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
                data.push(wrapFootage(asset));
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
        .replace('/*USERSCRIPT*/', data.join('\n'))
    );

    return Promise.resolve(job)
}
