const fs = require('fs')
const strip = require('strip-comments');

const escapeForRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Find instances of a function inside a single-line string.
const REGEX_FN_DETECT = new RegExp(/(?:(?:(?:function *(?:[a-zA-Z0-9_]+)?) *(?:\((?:.*)\)) *(?:\{(?:.*)\}))|(?:(?:.*) *(?:=>) *(?:\{)(?:.*?)?\}))/);


// This regex will detect a self-invoking function like (function(){})() and will catch the invoking parameters in a single string for further inspection.
const REGEX_SELF_INVOKING_FN = new RegExp(/(?:(?:^\() *(?:.*?)(?:} *\)))(?: *(?:\() *(.*?) *(?:\) *$))/, "gm");

/**
 * Parse method from parameter
 * @description                    Given a parameter detect whether it should be casted as a function in the final argument injection.
 * @param param                (string|number|boolean|null|object|array) The parameter to parse a method from.
 * @return bool                (Boolean) If a method is detected then it's stripped from String quotes, else it's returned in it's original type.
*/
const isMethod = (param) => {
    if (typeof param == "string") {
        return (param.match(REGEX_FN_DETECT) ? true : false);
    }
    return false
}

const getSearchUsageByMethodRegex = (keyword = 'NX', method = "set", flags = "g") => {
    const str = `(?<!(?:[\\/\\s]))(?<!(?:[\\*\\s]))(?:\\s*${keyword}\\s*\\.)\\s*(${method})\\s*(?:\\()(?:["']{1})([a-zA-Z0-9._-]+)(?:["']{1})(?:\\))`;
    return new RegExp(str, flags);
}

function EnhancedScript (
            dest,
            src,
            parameters = [],
            keyword = "NX",
            defaults = {
                global: "null",
                string: "",
                number: 0,
                array: [],
                boolean: false,
                object: {},
                function: function (){},
                null: null
            },
            jobID,
            logger
    ) {
        this.scriptPath = src;
        this.script = fs.readFileSync(dest, 'utf8');
        this.keyword = keyword;
        this.defaults = defaults;
        this.jobID = jobID;
        this.logger = logger;
        this.jsonParameters = parameters;

        /** @type { key: string
         *   isVar: boolean
         *   isFn: boolean
         *   needsDefault: boolean.
         *  }
        */
        this.missingJSONParams = [];
    }

    /**
     * Get Default Value
     * @description                Retrieves a default value parameter based on a key.
     * @param key                  (String)("string"|"number"|"array"|"object"|"null"|"function") The key to the required default parameter. Defaults to "null".
     * @returns default            The value from this.defaults array.
     */
    EnhancedScript.prototype.getDefaultValue = function(key) { return key in this.defaults ? this.defaults[key] : this.defaults[this.defaults.global]; }

    EnhancedScript.prototype.parseMethod = function (parameter) {
        const selfInvokingFn = [...parameter.value.matchAll(REGEX_SELF_INVOKING_FN)];
        if (selfInvokingFn ) {
            return this.parseMethodWithArgs(parameter);
        }
        return parameter.value;
    }

    EnhancedScript.prototype.matchAsJSONParameterKey = function( key ) {
        const parameterMatch = this.jsonParameters.find(o => o.key == key);
        return parameterMatch ? parameterMatch.value : key;
    }

    EnhancedScript.prototype.parseMethodWithArgs = function (parameter) {
        let value = parameter.value;
        const methodArgs = [...parameter.value.matchAll(getSearchUsageByMethodRegex(this.keyword, 'arg', "gm"))];

        if (methodArgs.length > 0 ) {
            this.logger.log("We found a self-invoking method with arguments!");
            this.logger.log(JSON.stringify(methodArgs));

            let arg, fullMatch;
            const foundArgument = methodArgs.filter( argMatch => {
                fullMatch = argMatch[0]
                arg = argMatch[2];

                return parameter.arguments && parameter.arguments.find(o => o.key == arg);
            });

            if (foundArgument) {
                // Search if argument is present in JSON and has `arguments` array to match against the results.
                // And do a replacement with either the found argument on the array or a global default value.
                let argReplacement = parameter.arguments && parameter.arguments.find(o => o.key == arg).value || this.getStringifiedDefaultValue(this.defaults.global);
                const fullMatchRegex = new RegExp(escapeForRegex(fullMatch), "gm");
                value = parameter.value.replace(fullMatchRegex, argReplacement);
            }
        }

        return value;
    }

    EnhancedScript.prototype.detectValueType = function (parameter) {
        return isMethod(parameter.value) ? this.parseMethod(parameter) : JSON.stringify(parameter.value);
    }

    /**
     * Get Default Value as String
     * @description                Retrieves a default value parameter based on a key.
     * @param key                  (String)("string"|"number"|"array"|"object"|"null"|"function") The key to the required default parameter. Defaults to "null".
     * @returns default            (String) A template literal string with the embedded default parameter. If it's a string then it's wrapped with quotes.
     */
    EnhancedScript.prototype.getStringifiedDefaultValue = function (key) {
        return JSON.stringify(this.getDefaultValue(key))
    }

    /**
     * Find Missing Matches in JSX Script
     * ====================
     * @description                RegEx Searches a given JSX script to find occurences and saves an object with keys
     * @return bool                (Boolean)           Whether or not there are any variables to inject. Defaults to false.
     */
    EnhancedScript.prototype.findMissingMatchesInJSX = function () {
        const script = strip(this.script);

        // Parse all occurrences of the usage of NX on the provided script.
        const nxMatches = [...script.matchAll(getSearchUsageByMethodRegex(this.keyword, "get", "gm"))];

        if (nxMatches && nxMatches.length > 0 ) {
            nxMatches.forEach( match => {
                const keyword = match[2];

                var nxMatch = {
                    key: keyword.replace(/\s/g, ''),
                    isVar: false,
                    isFn: false,
                    value: this.getDefaultValue(match.default ? match.default : this.defaults.global)
                };
                if (this.jsonParameters.filter( o => o.key == nxMatch.key ).length == 0) { // If the parameter doesn't have a value defined in JSON
                    this.missingJSONParams.push(nxMatch);
                }
            });
        }

        const numMissing = this.missingJSONParams.length;
        if (numMissing > 0) {
            this.logger.log(`[${this.jobID}] ${this.displayAlert()}`);
        }
        return numMissing > 0;
    }


    /**
     * Generated Placeholder Parameters
     * ================================
     * @description            Generates placeholder for "parameters" JSON Object based on keys from an array.
     * @return string          (String)    JSON "parameters" object.
     */
     EnhancedScript.prototype.generatePlaceholderParameters = function ( ) {
        const template = (key) => `
                {
                    "key" : "${key}",
                    "value" : ${this.getStringifiedDefaultValue(this.defaults.global)}
                }\n
        `;
        return `
            "parameters" : [
                ${this.missingJSONParams.map((k) => template(k.key)).join("\n")}
            ]
        `
    }

    /** 
     * Display Missing Alert
     * =====================
     * @description              Display a log message if theres any missing parameter set on the JSON configuration but is being referred in the script.
     * @return string           (String)   The template literal string displaying all the occurences if any.
    */
    EnhancedScript.prototype.displayAlert = function () {
        const keyword = this.keyword;

        return ` -- W A R N I N G --
        The following parameters used in the script were NOT found on the JSON "parameters" object of your script asset ${this.scriptPath }

            ${this.missingJSONParams.map(o => o.key).join(", ")}

        Please set defaults in your JSX script (see documentation) or copy the following placeholder JSON code snippet and replace the values with your own:

        ${this.generatePlaceholderParameters()}

        Remember to always use a fallback default value for any use of the ${keyword} object to have the ability to run this script on After Effects directly.
        Example:
            const dogName = ${keyword} && ${keyword}.get("doggo") || "Doggo";
        `
    }

    EnhancedScript.prototype.injectParameters = function () {
        return [...this.jsonParameters, ...this.missingJSONParams].map( param => {
            let value = param.type ? this.getStringifiedDefaultValue(param.type) : this.getDefaultValue(this.defaults.global);

            if (param.value ) {
                value = this.detectValueType(param);
            }

            return `${this.keyword}.set('${param.key}', ${value});`
        }).join("\n");
    }

    EnhancedScript.prototype.buildParameterConfigurator = function () {
        const defaultGlobalValue = this.getStringifiedDefaultValue( this.defaults.global );
        // const defaultFnValue = this.getDefaultValue( this.defaults.function );
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
                        if (typeof this.params[i].value == "function") return this.call(key, args || []);
                        return this.params[i].value;
                    };
                }
                return ${ defaultGlobalValue }
            };
            var ${ this.keyword } = new ParameterConfigurator();

            // Parameter injection from job configuration
            ${ this.injectParameters() }
        `;

        return createParameterConfigurator();
    }

    EnhancedScript.prototype.build = function () {
        this.findMissingMatchesInJSX();

        // Et voilà!
        const enhancedScript = `(function() {
            ${this.buildParameterConfigurator()}
            ${this.script}
        })();\n`;

        // do not log the script (can be uncommented for debugging)
        // this.logger.log(enhancedScript);
        return enhancedScript;
}


module.exports = EnhancedScript