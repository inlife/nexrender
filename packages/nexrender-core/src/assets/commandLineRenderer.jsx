module.exports = /*syntax:js*/`// Command line renderer for After Effects. (nexrender-patch-v1.0.0)

// This function constructs an AECommandLineRenderer object.
// One and only one of these will be created to perform rendering tasks
// at the end of this file.
//
// The constructor has 3 sections:
// [1] define all the variable-type attributes used by this class;
// [2] define all the functions used by this class;
// [3] assign all the functions to be method-type attributes.
//
function AECommandLineRenderer() {
    // [1] define all the variable-type attributes used by this class
    //
    // Input before parsing
    //
    this.inArgs = null;
    //
    // Input after parsing
    //
    this.in_project_path = null;
    this.in_comp_name = null;
    this.in_rq_index = null;
    this.in_RStemplate = null;
    this.in_OMtemplate = null;
    this.in_output_path = null;
    this.in_logfile_path = null;
    this.in_start_frame = null;
    this.in_end_frame = null;
    this.in_increment = null;
    this.in_image_cache_percent = null;
    this.in_max_mem_percent = null;
    this.in_verbose_flag = null;
    this.in_close_flag = null;
    this.in_sound_flag = null;
    this.in_port_address = null;
    this.in_stop_on_missing_frame = true;
    this.in_script_path = null;
    //
    // Exit codes:
    //
    this.EXIT_OK = 0;
    this.EXIT_FAILURE_CODE_FROM_APP = 1;
    this.EXIT_SHOW_USAGE = 2;
    this.EXIT_SYNTAX_ERROR = 3;
    this.EXIT_SYNTAX_ERROR_USER_LOG = 4;
    this.EXIT_OTHER_SCRIPTING_ERROR = 5;
    this.EXIT_OTHER_SCRIPTING_ERROR_USER_LOG = 6;
    this.EXIT_AERENDER_RUNTIME = 7;
    this.EXIT_AERENDER_RUNTIME_USER_LOG = 8;
    this.EXIT_AE_RUNTIME = 9;
    this.EXIT_AE_RUNTIME_USER_LOG = 10;
    this.EXIT_CANNOT_OPEN_SOCKET = 11;
    this.EXIT_CODE_NO_LONGER_IN_USE = 12;
    //
    // Exit code message prefixes:
    //
    this.EXIT_MSG_PREFIX = new Array(
        "", // EXIT_OK
        "ERROR: ", // EXIT_FAILURE_CODE_FROM_APP
        "USAGE: ", // EXIT_SHOW_USAGE
        "SYNTAX ERROR: ", // EXIT_SYNTAX_ERROR
        "SYNTAX ERROR: ", // EXIT_SYNTAX_ERROR_USER_LOG
        "ERROR: ", // EXIT_OTHER_SCRIPTING_ERROR
        "ERROR: ", // EXIT_OTHER_SCRIPTING_ERROR_USER_LOG
        "ERROR: ", // EXIT_AERENDER_ERROR
        "ERROR: ", // EXIT_AERENDER_ERROR_USER_LOG
        "ERROR: ", // EXIT_AE_RUNTIME
        "ERROR: ", // EXIT_AE_RUNTIME_USER_LOG
        "ERROR: ", // EXIT_CANNOT_OPEN_SOCKET
        "", // EXIT_CODE_NO_LONGER_IN_USE
    );
    //
    // Messages:
    //
    this.MSG_NONE = "";
    this.MSG_NOT_HANDLED_HERE = "reported by another script or AE runtime.";
    this.MSG_SHOW_USAGE = "";
    this.MSG_TRIED_TO_PARSE_UNDEFINED = "aerender tried to parse an undefined argument.";
    this.MSG_UNDEFINED_VALUE_FOR_FLAG = "no value given for flag: ";
    this.MSG_BAD_FLAG = "Illegal argument flag: ";
    this.MSG_NO_PROJECT = "No project provided and no project open.";
    this.MSG_BAD_VERBOSE_FLAG = "Bad value for -verbose.";
    this.MSG_BAD_CLOSE_FLAG = "Bad value for -close.";
    this.MSG_BAD_SOUND_FLAG = "Bad value for -sound.";
    this.MSG_BAD_INCREMENT = "Bad value for -increment. Must be between 1 and 100, inclusive.";
    this.MSG_COMP_NOT_FOUND = "No comp was found with the given name.";
    this.MSG_RQINDEX_NOT_FOUND = "No render queue item was found with the given index.";
    this.MSG_AE_RUNTIME = "Runtime error in After Effects.";
    this.MSG_ADDING_TO_RQ = "PROGRESS: Adding specified comp to Render Queue";
    this.MSG_NEEDS_OUTPUT = "Specified render queue item needs output file but none provided.";
    this.MSG_RS_TEMPLATE_NOT_FOUND = "No render settings template was found with the given name.";
    this.MSG_OM_TEMPLATE_NOT_FOUND = "No output module template was found with the given name.";
    this.MSG_CAN_NOT_OPEN_SOCKET = "Can not open socket.";
    this.MSG_NO_COMP_YES_TEMPLATE = "WARNING: -RStemplate argument ignored since no -comp or -rqindex provided.";
    this.MSG_NO_COMP_YES_OMTEMPLATE = "WARNING: -OMtemplate argument ignored since no -comp  or -rqindex provided.";
    this.MSG_NO_COMP_YES_OUTPUT = "WARNING: -output argument ignored since no -comp  or -rqindex provided.";
    this.MSG_NO_COMP_YES_START_OR_END = "WARNING: -s and/or -e arguments ignored since no -comp  or -rqindex provided.";
    this.MSG_NO_COMP_YES_INCREMENT = "WARNING: -i argument ignored since no -comp  or -rqindex provided.";
    this.MSG_SKIPPING_WILL_CONTINUE = "INFO: Skipping render queue item with correct comp name but marked to continue from a partly complete render.";
    this.MSG_RENDER_ABORTED = "INFO: Render aborted.";
    this.MSG_SCRIPT_CAN_NOT_EXEC = "aerender ERROR: Error executing script: ";
    this.MSG_SCRIPT_CAN_NOT_OPEN = "aerender ERROR: Can not open script file. Make sure path is correct: ";

    // These don't get the prefix printed since they are not exit messages
    this.MSG_LOG_DIR_NO_EXISTS = "aerender ERROR: Directory specified for log file does not exist: ";
    this.MSG_LOG_DIR_NOT_A_DIR = "aerender ERROR: Directory specified for log file is a file, not a directory: ";
    this.MSG_LOG_CAN_NOT_OPEN = "aerender ERROR: Can not open log file. Try checking write protection of directory: ";
    //
    // Variables for rendering
    //
    this.log_file = null;
    this.has_user_log_file = false;
    this.is_verbose_mode = true;
    this.saved_sound_setting = null;
    this.my_sound_setting = null;

    // [2] define all the functions used by this class
    //
    // Report an error. This writes errors to the log file, if present.
    // This is called from the context of the application, so we
    // need to precede variable names with gAECommandLineRenderer
    // 
    function checkParentDied() {
        var result = false;
        if (gAECommandLineRenderer.log_file instanceof Socket) {
            if (!gAECommandLineRenderer.log_file.connected) {
                app.project.renderQueue.stopRendering();
                result = true;
            }
        }
        return result;
    }

    function my_onError(error_string, severity_string) {
        // This method is called with a variety of types of messages.
        // The severity_string tells us what kind.
        // Choices are:
        // NAKED, INFO, WARNING, PROBLEM, FATAL, PROGRESS, and DEBUG

        // Two of these, PROBLEM and FATAL, are errors that should cause us to change
        // the exit code:
        checkParentDied();
        if (severity_string == "PROBLEM" || severity_string == "FATAL") {
            // These two errors cause us to change the exit code.
            // We don't write an error or throw here, because we got here as part of a thrown 
            // error already, and the message will be printed as part of the catch.
            gAECommandLineRenderer.SetExitCode(gAECommandLineRenderer.EXIT_AE_RUNTIME);
        } else {
            // PROBLEM and FATAL will throw exceptions, and so will be logged to the file
            // when we catch the exception.
            // All other errors (NAKED, INFO, WARNING, PROGRESS, and DEBUG) will not 
            // throw exceptions.  So we log them to the file right here:
            if (gAECommandLineRenderer.is_verbose_mode) {
                if (gAECommandLineRenderer.log_file != null) {
                    if (severity_string == "NAKED") {
                        // everybody is confused by this category.  Just use INFO instead.
                        gAECommandLineRenderer.log_file.writeln("INFO:" + error_string);
                    } else {
                        gAECommandLineRenderer.log_file.writeln(severity_string + ":" + error_string);
                    }
                }
            }
        }
        // call the error handler that was in place before we started rendering.
        if (gAECommandLineRenderer.oldErrorHandler) {
            gAECommandLineRenderer.oldErrorHandler(error_string, severity_string);
        }
    }

    // Report an error and throw an exception.
    // Causes the script to exit.
    function my_SetExitCodeAndThrowException(code, message) {
        this.SetExitCode(code);
        throw (this.EXIT_MSG_PREFIX[code] + message);
    }

    // Report an error. This establishes exitCodes for reporting errors from AfterFX.
    function my_SetExitCode(code) {
        // Some codes are set differently depending on whether we have a custom user 
        // log file.  Check for these and use the alternate if appropriate.
        var real_code = code;
        if (gAECommandLineRenderer.has_user_log_file) {
            switch (real_code) {
                case gAECommandLineRenderer.EXIT_SYNTAX_ERROR:
                    real_code = gAECommandLineRenderer.EXIT_SYNTAX_ERROR_USER_LOG;
                    break;
                case gAECommandLineRenderer.EXIT_OTHER_SCRIPTING_ERROR:
                    real_code = gAECommandLineRenderer.EXIT_OTHER_SCRIPTING_ERROR_USER_LOG;
                    break;
                case gAECommandLineRenderer.EXIT_AERENDER_RUNTIME:
                    real_code = gAECommandLineRenderer.EXIT_AERENDER_RUNTIME_USER_LOG;
                    break;
                case gAECommandLineRenderer.EXIT_AE_RUNTIME:
                    real_code = gAECommandLineRenderer.EXIT_AE_RUNTIME_USER_LOG;
                    break;
            }
        }

        // Always keep the first error. So only set if the exitCode is still EXIT_OK.
        if (app.exitCode == gAECommandLineRenderer.EXIT_OK) {
            app.exitCode = real_code;
        }
    }

    // Arguments may be enclosed in quotes.  This 
    // will remove them and return the result.
    function my_StripAnyEnclosingQuotes(inString) {
        var result = inString;
        if (inString &&
            inString.charAt(0) == '"' &&
            inString.charAt(inString.length - 1) == '"') {
            result = inString.substring(1, inString.length - 1);
        }
        return result;
    }

    // Make sure the value is there, and returns it, stripping away any enclosing quotes.
    //
    function my_GetValueForFlag(arg_num, the_flag) {
        if (!this.inArgs[arg_num]) {
            this.SetExitCodeAndThrowException(this.EXIT_SYNTAX_ERROR, (this.MSG_UNDEFINED_VALUE_FOR_FLAG + the_flag));
        }
        return this.StripAnyEnclosingQuotes(this.inArgs[arg_num]);
    }

    // Parse the parameter.
    // Return the number of arguments used in parsing the parameter.
    function my_ParseParamStartingAt(arg_num) {
        if (!this.inArgs[arg_num]) {
            this.SetExitCodeAndThrowException(this.EXIT_AERENDER_RUNTIME, this.MSG_TRIED_TO_PARSE_UNDEFINED);
        }

        var num_args_parsed = 0;

        // Check for a valid flag:
        var my_flag = this.inArgs[arg_num];
        if (my_flag == "-port") {
            // -port is used by aerender to specify a port address for a socket.
            //
            // Note: this value is sought/parsed earlier, in the SetupDefaultLog method.
            // We can just ignore here.
            var dummy = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-project") {
            this.in_project_path = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-comp") {
            this.in_comp_name = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-rqindex") {
            this.in_rq_index = parseInt(this.GetValueForFlag(arg_num + 1, my_flag));
            num_args_parsed = 2;
        }
        if (my_flag == "-RStemplate") {
            this.in_RStemplate = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-OMtemplate") {
            this.in_OMtemplate = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-output") {
            this.in_output_path = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-log") {
            this.in_logfile_path = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-s") {
            this.in_start_frame = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-e") {
            this.in_end_frame = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-i") {
            this.in_increment = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-mem_usage") {
            this.in_image_cache_percent = this.GetValueForFlag(arg_num + 1, my_flag);
            this.in_max_mem_percent = this.GetValueForFlag(arg_num + 2, my_flag);
            num_args_parsed = 3;
        }
        if (my_flag == "-v") {
            this.in_verbose_flag = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }

        if (my_flag == "-r") {
            this.in_script_path = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }

        if (my_flag == "-close") {
            this.in_close_flag = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-sound") {
            this.in_sound_flag = this.GetValueForFlag(arg_num + 1, my_flag);
            num_args_parsed = 2;
        }
        if (my_flag == "-doSavePrefsOnQuit") {
            // The effect of this flag will be taken into account when we
            // exit the app. See comment in the "finally" block.
            // All we do here is increment the num_args_parsed count.
            num_args_parsed = 1;
        }
        if (my_flag == "-continueOnMissingFootage") {
            this.in_stop_on_missing_frame = false;
            num_args_parsed = 1;
        }

        if (num_args_parsed == 0) {
            this.SetExitCodeAndThrowException(this.EXIT_SYNTAX_ERROR, (this.MSG_BAD_FLAG + my_flag));
        }

        return num_args_parsed;
    }

    // This parses the inArgs array.  Assumes
    // the array has already been filled.
    function my_ParseInArgs() {
        // First, undefine all the inputs we're potentially looking for
        this.in_project_path = null;
        this.in_comp_name = null;
        this.in_rq_index = null;
        this.in_RStemplate = null;
        this.in_OMtemplate = null;
        this.in_output_path = null;
        this.in_logfile_path = null;
        this.in_start_frame = null;
        this.in_end_frame = null;
        this.in_increment = null;
        this.in_image_cache_percent = null;
        this.in_max_mem_percent = null;
        this.in_verbose_flag = null;
        this.in_close_flag = null;
        this.in_sound_flag = null;
        this.in_script_path = null;

        // Special case: check if any argument is "-help"
        for (var i = 0; i < this.inArgs.length; i++) {
            if (this.inArgs[i] == "-help") {
                this.SetExitCodeAndThrowException(this.EXIT_SHOW_USAGE, this.MSG_SHOW_USAGE);
            }
        }

        var arg_num = 0;
        while (arg_num < this.inArgs.length) {
            // ParseParamStartingAt returns the number of arguments used up parsing the param.
            arg_num += this.ParseParamStartingAt(arg_num);
        }
    }

    // This arg is treated differently than others because it's extra important
    // that we exit properly in the face of anything that might go wrong even
    // during initialization. So we don't parse the standard way, we check this
    // before exit...
    function my_IsSavePrefsArgGiven(arglist) {
        return this.IsInArray("-doSavePrefsOnQuit", arglist);
    }

    // Returns true if the item equals an item in the array, false if otherwise.
    function my_IsInArray(needle, haystack) {
        result = false;
        for (var i = 0; i < haystack.length; i++) {
            if (needle == haystack[i]) {
                result = true;
                break;
            }
        }
        return result;
    }

    function my_SetupDefaultLog(arg_list) {
        this.has_user_log_file = false;

        // Clean up after a potentially bad exit last time:
        if (this.log_file && this.log_file != null) {
            this.log_file.close();
            this.log_file = null;
        }

        // Open the socket.
        // It is used:
        // [a] to log errors if there is no user-specified log file (specified with a "-log" arg)
        // [b] to log errors encountered while opening any user-specified log file.

        // See if a -port argument was passed:
        this.log_file = null;
        for (var i = 0; i < arg_list.length; i++) {
            if (arg_list[i] == "-port") {
                if (arg_list.length > i + 1) {
                    // The argument value is the port address
                    this.in_port_address = arg_list[i + 1];
                    // Yes, the log_file variable is being used to hold a socket.
                    this.log_file = new Socket();

                    // cprosser [26961]
                    // could possibly use ISO-8856-1 for non japanese systems,
                    // but I am going for small changes now.
                    // and again cprosser 8/8/2005 [33884]
                    // CP_OEMCP means use the OEM code page, the default
                    // for the console.
                    // alas, it doens't understand that so we are hardcoding
                    // codepage 850. Not the default on windows for US systems
                    // but should be the default on european systems and will
                    // get the high ascii correct.
                    // Search for chcp at microsoft for info on changing
                    // the console.
                    // on the mac, leave as binary
                    var encoding_string = "binary";

                    if (system.osName.search("Windows") != -1) {
                        encoding_string = "WINDOWS-850";
                        //encoding_string = "CP_OEMCP";
                    }

                    if (app.language == Language.JAPANESE) {
                        encoding_string = "Shift-JIS";
                    }
                    if (app.isoLanguage == "ko_KR") {
                        encoding_string = "EUC-KR";
                    }
                    if (!this.log_file.open(this.in_port_address, encoding_string)) {
                        this.log_file = null;
                        this.SetExitCodeAndThrowException(this.EXIT_CANNOT_OPEN_SOCKET,
                            this.MSG_CAN_NOT_OPEN_SOCKET);
                    }
                }
            }
        }
        this.is_verbose_mode = true;
    }

    function my_CleanupDefaultLog() {
        // Close the log file
        if (this.log_file != null) {
            this.log_file.close();
            this.log_file = null;
        }
    }

    // This is the external entry point.
    // Bat files or executables may call this method.
    //
    // This function assumes that it has been passed all the arguments.
    // It parses the arguments and then renders.
    function my_Render() {
        app.beginSuppressDialogs();

        if (checkParentDied()) {
            return;
        }

        try {
            this.SetupDefaultLog(my_Render.arguments);

            // start by assuming successful execution, exit code 0.
            app.exitCode = 0;

            // Check number of arguments
            if (!my_Render.arguments || my_Render.arguments.length == 0) {
                this.SetExitCodeAndThrowException(this.EXIT_SHOW_USAGE, this.MSG_SHOW_USAGE);
            }

            var numArgs = my_Render.arguments.length;
            // Allocate the array of arguments:
            this.inArgs = new Array(numArgs);

            // Load the input arguments into the inArgs array.
            for (var i = 0; i < numArgs; i++) {
                this.inArgs[i] = my_Render.arguments[i];
            }

            // Parse the arguments, and render
            this.ParseInArgs();

            if (checkParentDied()) {
                return;
            }

            this.ReallyRender();
        } catch (error) {
            // Add any errors to the log file.
            if (this.log_file != null) {
                this.log_file.writeln("aerender " + error.toString());
            }
            this.SetExitCode(this.EXIT_AE_RUNTIME);
        } finally {
            // This arg is treated differently than others because it's extra important
            // that we exit properly in the face of anything that might go wrong even
            // during initialization. So we don't parse the standard way, we check this
            // before exit...
            app.setSavePreferencesOnQuit(this.IsSavePrefsArgGiven(my_Render.arguments));

            this.CleanupDefaultLog();
            app.endSuppressDialogs(false);
            app.reportErrorOnMissingFrame = false;
        }
    }

    function my_ReallyRender() {
        this.saved_sound_setting = null;
        app.reportErrorOnMissingFrame = this.in_stop_on_missing_frame;

        try {
            // While rendering we'll report errors to the log file.
            if (app.onError == this.onError) {
                // If the previous error handler is just this one, don't store it. 
                // That can happen in extreme cases where this script does not get a
                // chance to clean up and put back the oldErrorHandler when it's done.
                this.oldErrorHandler = null;
            } else {
                this.oldErrorHandler = app.onError;
            }
            app.onError = this.onError;
            // Open the user log file, if specified, and use it instead of the socket.
            if (this.in_logfile_path) {
                // Keep the socket open; errors we encounter while opening the
                // user log file will be logged to the socket.
                var user_log_file = new File(this.in_logfile_path);
                var parent_dir = user_log_file.parent;
                if (!parent_dir.exists) {
                    if (this.log_file) {
                        this.log_file.writeln(this.MSG_LOG_DIR_NO_EXISTS + this.in_logfile_path);
                    }
                    this.SetExitCodeAndThrowException(this.EXIT_AE_RUNTIME, this.MSG_AE_RUNTIME);
                }
                var test_folder = Folder(parent_dir);
                if (!(test_folder instanceof Folder)) {
                    if (this.log_file) {
                        this.log_file.writeln(this.MSG_LOG_DIR_NOT_A_DIR + this.in_logfile_path);
                    }
                    this.SetExitCodeAndThrowException(this.EXIT_AE_RUNTIME, this.MSG_AE_RUNTIME);
                }
                if (!user_log_file.open("w", 'TEXT', 'ttxt')) {
                    if (this.log_file) {
                        this.log_file.writeln(this.MSG_LOG_CAN_NOT_OPEN + this.in_logfile_path);
                    }
                    this.SetExitCodeAndThrowException(this.EXIT_AE_RUNTIME, this.MSG_AE_RUNTIME);
                }

                // no errors were encountered opening the file.
                // Close the socket and use this one instead.
                if (this.log_file != null) {
                    this.log_file.close();
                }
                this.log_file = user_log_file; // which is still open
                this.has_user_log_file = true;
            }

            if (this.in_verbose_flag) {
                if (this.in_verbose_flag == "ERRORS") {
                    this.is_verbose_mode = false;
                } else if (this.in_verbose_flag == "ERRORS_AND_PROGRESS") {
                    this.is_verbose_mode = true;
                } else {
                    this.SetExitCodeAndThrowException(this.EXIT_SYNTAX_ERROR, this.MSG_BAD_VERBOSE_FLAG);
                }
            }
            if (this.in_close_flag) {
                if (this.in_close_flag != "DO_NOT_CLOSE" &&
                    this.in_close_flag != "DO_NOT_SAVE_CHANGES" &&
                    this.in_close_flag != "SAVE_CHANGES") {
                    this.SetExitCodeAndThrowException(this.EXIT_SYNTAX_ERROR, this.MSG_BAD_CLOSE_FLAG);
                }
            }
            if (this.in_sound_flag) {
                if (this.in_sound_flag != "ON" &&
                    this.in_sound_flag != "OFF" &&
                    this.in_sound_flag != "on" &&
                    this.in_sound_flag != "off") {
                    this.SetExitCodeAndThrowException(this.EXIT_SYNTAX_ERROR, this.MSG_BAD_SOUND_FLAG);
                }
            }

            // Set the memory usage, if specified as an argument.
            if (this.in_image_cache_percent && this.in_max_mem_percent) {
                app.setMemoryUsageLimits(this.in_image_cache_percent, this.in_max_mem_percent);
            }

            // If the user provided a project, close the current project and open the project specified.
            // Else, leave the current project open.
            if (this.in_project_path) {
                // Close the current project
                if (app.project != null) {
                    app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
                }

                // Open the specified project:
                var proj_file = new File(this.in_project_path);
                app.openFast(proj_file);
            }
            if (!app.project) {
                this.SetExitCodeAndThrowException(this.EXIT_AERENDER_RUNTIME, this.MSG_NO_PROJECT);
            }

            if (this.in_script_path) {
                this.log_file.writeln("Running Script: " + this.in_script_path);
                var scriptFile = new File(this.in_script_path);

                scriptFile.encoding = "UTF-8";
                if (!scriptFile.open("r")) {
                    if (this.log_file) {
                        this.log_file.writeln(this.MSG_SCRIPT_CAN_NOT_OPEN + this.in_script_path);
                    }
                    this.SetExitCodeAndThrowException(this.EXIT_AE_RUNTIME, this.MSG_AE_RUNTIME);
                }

                try {
                    // To force eval to use the global scope
                    // we cant use eval.call or eval.apply directly
                    // we have to use a closure to force it to do this
                    // 
                    // This is temporary till libraries are auto-included in Startup folder
                    // (function(scriptString) {
                    //     eval(scriptString);
                    // }).apply($.global, [scriptFile.read()]);
                    eval(scriptFile.read());
                } catch (e) {
                    if (this.log_file) {
                        this.log_file.writeln(this.MSG_SCRIPT_CAN_NOT_EXEC + this.in_script_path);
                        this.log_file.writeln(e);
                    }
                    this.SetExitCodeAndThrowException(this.EXIT_AE_RUNTIME, this.MSG_AE_RUNTIME);
                }

                scriptFile.close();
            }

            // Get the RenderQueueItem for the specified comp, if specified.
            var rqi = null;
            if (this.in_comp_name) {
                rqi = this.GetFirstQueuedRQItemWithName(this.in_comp_name);
            } else if (this.in_rq_index != null) {
                this.log_file.writeln("rqindex " + this.in_rq_index + "num " + app.project.renderQueue.numItems);
                if (this.in_rq_index >= 1 && this.in_rq_index <= app.project.renderQueue.numItems) {
                    rqi = app.project.renderQueue.item(this.in_rq_index);
                } else {
                    this.SetExitCodeAndThrowException(this.EXIT_AERENDER_RUNTIME, this.MSG_RQINDEX_NOT_FOUND);
                }
            }
            if (this.in_comp_name && !rqi) {
                // Try to find the comp in the project and add to the render queue:
                rqi = this.AddCompToRenderQueue(this.in_comp_name);
                if (rqi) {
                    if (this.log_file != null) {
                        this.log_file.writeln(this.MSG_ADDING_TO_RQ);
                    }
                } else {
                    this.SetExitCodeAndThrowException(this.EXIT_AERENDER_RUNTIME, this.MSG_COMP_NOT_FOUND);
                }
            }

            // Apply the templates, if provided
            if (this.in_RStemplate) {
                if (!rqi) {
                    if (this.log_file != null) {
                        this.log_file.writeln(this.MSG_NO_COMP_YES_TEMPLATE);
                    }
                } else {
                    if (!this.IsInArray(this.in_RStemplate, rqi.templates)) {
                        this.SetExitCodeAndThrowException(this.EXIT_AERENDER_RUNTIME, this.MSG_RS_TEMPLATE_NOT_FOUND);
                    }
                    rqi.applyTemplate(this.in_RStemplate);
                }
            }
            if (this.in_OMtemplate) {
                if (!rqi) {
                    if (this.log_file != null) {
                        this.log_file.writeln(this.MSG_NO_COMP_YES_OMTEMPLATE);
                    }
                } else {
                    if (!this.IsInArray(this.in_OMtemplate, rqi.outputModule(1).templates)) {
                        this.SetExitCodeAndThrowException(this.EXIT_AERENDER_RUNTIME, this.MSG_OM_TEMPLATE_NOT_FOUND);
                    }
                    rqi.outputModule(1).applyTemplate(this.in_OMtemplate);
                }
            }

            // If a comp was specified, make it the only one to render.
            // If none was provided, leave everything alone so render queue renders as is.
            if (rqi) {
                this.EstablishAsOnlyQueuedItem(rqi);
            }

            if (rqi) {
                // If the user provided a path, set the output path on rqi's OutputModule
                if (rqi.status == RQItemStatus.NEEDS_OUTPUT && !this.in_output_path) {
                    this.SetExitCodeAndThrowException(this.EXIT_AERENDER_RUNTIME, this.MSG_NEEDS_OUTPUT);
                }
                if (this.in_output_path) {
                    var om = rqi.outputModule(1);
                    om.file = new File(this.in_output_path);
                }
            } else {
                if (this.in_output_path) {
                    if (this.log_file != null) {
                        this.log_file.writeln(this.MSG_NO_COMP_YES_OUTPUT);
                    }
                }
            }

            // Set the start and end frames.
            if (this.in_start_frame || this.in_end_frame) {
                if (!rqi) {
                    if (this.log_file != null) {
                        this.log_file.writeln(this.MSG_NO_COMP_YES_START_OR_END);
                    }
                } else {
                    // Render times are stored as timeSpanStart and timeSpanDuration.
                    // Setting only the timeSpanStart will not change the timeSpanDuration and 
                    // so will move the end time, but we want the end time unchanged if 
                    // it was not specified.
                    // So we must calculate both start_time and end_time, 
                    // then set both timeSpanStart and timeSpanDuration.
                    // Note: frameDuration is stored in the comp.
                    var start_time = rqi.timeSpanStart;
                    var end_time = rqi.timeSpanStart + rqi.timeSpanDuration;
                    if (this.in_start_frame) {
                        start_time = -rqi.comp.displayStartTime + ((parseInt(this.in_start_frame, 10) - app.project.displayStartFrame) * rqi.comp.frameDuration);
                    }
                    if (this.in_end_frame) {
                        // The way AE works, final frame is not included.
                        // But aerender wants final frame included.
                        // So, just add 1 to end frame right here before setting
                        // duration for AE:
                        // Note: must call parseInt() here, or the 1 will be added as if it
                        // were a string. For example, 35 would become 351, not 36. Hoo boy!
                        var end_frame_plus_one = parseInt(this.in_end_frame, 10) + 1.0 - app.project.displayStartFrame;
                        end_time = -rqi.comp.displayStartTime + (end_frame_plus_one * rqi.comp.frameDuration);
                    }
                    rqi.timeSpanStart = start_time;
                    rqi.timeSpanDuration = end_time - start_time;
                }
            }

            // Set the skipFrames (based on increment).
            if (this.in_increment) {
                if (this.in_increment < 1 || this.in_increment > 100) {
                    this.SetExitCodeAndThrowException(this.EXIT_SYNTAX_ERROR, this.MSG_BAD_INCREMENT);
                }
                if (!rqi) {
                    if (this.log_file != null) {
                        this.log_file.writeln(this.MSG_NO_COMP_YES_INCREMENT);
                    }
                } else {
                    // Set the skipFrames based on the increment.
                    //
                    // Increment as defined here is one greater then the
                    // the render queue item's skipFrames.
                    // skipFrames 0 is the same as increment of 1.
                    // 
                    rqi.skipFrames = (this.in_increment - 1);
                }
            }

            // If we are in verbose mode, set the log type to ERRORS_AND_PER_FRAME_INFO 
            // for all RQ items we are about to render.
            if (this.is_verbose_mode) {
                this.SetLogPerFrameInfoInRQ();
            }

            this.SaveAndSetRenderSoundSetting();

            // Render!
            // true skips the recursive check for footage files
            // and will only check the one's used

            if (checkParentDied()) {
                return;
            }
            app.project.renderQueue.render(true);

        } catch (error) {
            // Add any errors to the log file.
            if (this.log_file != null) {
                this.log_file.writeln("aerender " + error.toString());
            }

            // It's possible that errors were encountered while trying to render.
            // Stop the render if in progress for a clean exit from the application.
            if (app.project && app.project.renderQueue && app.project.renderQueue.rendering) {
                // This will prevent the message "render stopped by user" from showing up...
                app.onError = null;
                app.project.renderQueue.stopRendering();
                // This will print a better message:
                if (this.log_file != null) {
                    this.log_file.writeln(this.MSG_RENDER_ABORTED);
                }
                app.onError = this.onError;
            }

            this.SetExitCode(this.EXIT_AE_RUNTIME);
        } finally {
            // Close the project.
            this.CloseProjectIfDesired();

            // Put back the old error handler
            app.onError = this.oldErrorHandler;

            // Restore the setting for hearing the render-done sound.
            this.RestoreRenderSoundSetting()
        }
    }

    // Returns the first item on the render queue that:
    // [a] contains a comp named comp_name
    // [b] has a render status of QUEUED or UNQUEUED or NEEDS_OUTPUT
    //     Note that if the status is NEEDS_OUTPUT, one better be provided or
    //     an error will result.
    //
    // If not found, returns null.
    //
    function my_GetFirstQueuedRQItemWithName(comp_name) {
        var result = null;

        var rq = app.project.renderQueue;
        if (rq && rq.numItems > 0) {
            var cur_item;
            // the items are indexed from 1 to numItems.
            for (var i = 1; i <= rq.numItems; i++) {
                cur_item = rq.item(i);
                if (cur_item.comp.name == comp_name &&
                    cur_item.status == RQItemStatus.WILL_CONTINUE) {
                    if (this.log_file != null) {
                        this.log_file.writeln(this.MSG_SKIPPING_WILL_CONTINUE);
                    }
                }
                if (cur_item.comp.name == comp_name &&
                    (cur_item.status == RQItemStatus.QUEUED ||
                        // pmi 9/24/03 -- do not render unqueued items. Let a new
                        // one be added instead.
                        // cur_item.status == RQItemStatus.UNQUEUED ||
                        cur_item.status == RQItemStatus.NEEDS_OUTPUT)) {
                    // We found it!
                    result = cur_item;
                    break;
                }
            }
        }

        return result;
    }

    // Find a comp with the given name, and adds it to the render queue.
    // Returns the newly added render queue item
    //
    // If not found, returns null.
    //
    function my_AddCompToRenderQueue(comp_name) {
        var result = null;

        // Get the comp with the name we are after
        var cur_item;
        var desired_comp = null;
        // the items in the project are indexed from 1 to numItems
        for (var i = 1; i <= app.project.numItems; i++) {
            cur_item = app.project.item(i);
            if (cur_item instanceof CompItem && cur_item.name == comp_name) {
                desired_comp = cur_item;
                break;
            }
        }

        // Add the desired_comp to the render queue.  The add() method
        // returns the new render queue item.
        if (desired_comp) {
            result = app.project.renderQueue.items.add(desired_comp);
        }

        return result;
    }

    // Sets the render flag on all RenderQueueItems other than rqi to false,
    //
    function my_EstablishAsOnlyQueuedItem(rqi) {
        var rq = app.project.renderQueue;
        if (rq && rq.numItems > 0) {
            var cur_item;
            // the items are indexed from 1 to numItems.
            for (var i = 1; i <= rq.numItems; i++) {
                cur_item = rq.item(i);
                if (cur_item == rqi) {
                    cur_item.render = true;
                } else {
                    // You can only change the render flag when these are the current status value:
                    if (cur_item.status == RQItemStatus.QUEUED ||
                        cur_item.status == RQItemStatus.UNQUEUED ||
                        cur_item.status == RQItemStatus.NEEDS_OUTPUT ||
                        cur_item.status == RQItemStatus.WILL_CONTINUE) {
                        cur_item.render = false;
                    }
                }
            }
        }
    }

    // Sets the log type to be ERRORS_AND_PER_FRAME_INFO for all items that are going to render.
    //
    function my_SetLogPerFrameInfoInRQ() {
        var rq = app.project.renderQueue;
        if (rq && rq.numItems > 0) {
            var cur_item;
            // the items are indexed from 1 to numItems.
            for (var i = 1; i <= rq.numItems; i++) {
                cur_item = rq.item(i);
                if (cur_item.render == true) {
                    if (cur_item.status != RQItemStatus.USER_STOPPED &&
                        cur_item.status != RQItemStatus.ERR_STOPPED &&
                        cur_item.status != RQItemStatus.RENDERING &&
                        cur_item.status != RQItemStatus.DONE) {
                        cur_item.logType = LogType.ERRORS_AND_PER_FRAME_INFO;
                    }
                }
            }
        }
    }

    // Closes the project if the close flag specifies to do so
    //
    function my_CloseProjectIfDesired() {
        if (app.project) {
            // Close the project we just used, if desired
            if (!this.in_close_flag || this.in_close_flag == "DO_NOT_SAVE_CHANGES") {
                // If no flag provided, this is the default.
                app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
            } else {
                if (this.in_close_flag == "SAVE_CHANGES") {
                    app.project.close(CloseOptions.SAVE_CHANGES);
                }
                // otherwise, flag is DO_NOT_CLOSE, so we do nothing.
            }
        }
    }

    function my_SaveAndSetRenderSoundSetting() {
        // Save the current setting for hearing the render-done sound, we'll restore it later.
        if (app.preferences.havePref("Misc Section",
                "Play sound when render finishes", PREFType.PREF_Type_MACHINE_INDEPENDENT)) {
            // Get the current value if the pref exists.
            this.saved_sound_setting = app.preferences.getPrefAsLong("Misc Section",
                "Play sound when render finishes", PREFType.PREF_Type_MACHINE_INDEPENDENT);
        } else {
            // default is to play the sound, value of 1.
            // Use this if the pref does not yet exist.
            this.saved_sound_setting = 1;
        }

        // Set the setting for hearing the render-done sound, based on the input, default is off.
        this.my_sound_setting = 0; // 0 is off
        if (this.in_sound_flag && (this.in_sound_flag == "ON" || this.in_sound_flag == "on")) {
            this.my_sound_setting = 1; // 1 is on
        }

        app.preferences.savePrefAsLong("Misc Section",
            "Play sound when render finishes",
            this.my_sound_setting, PREFType.PREF_Type_MACHINE_INDEPENDENT);
    }

    function my_RestoreRenderSoundSetting() {
        if (this.saved_sound_setting) {
            app.preferences.savePrefAsLong("Misc Section",
                "Play sound when render finishes",
                this.saved_sound_setting, PREFType.PREF_Type_MACHINE_INDEPENDENT);
        }
    }

    // [3] assign all the functions to be method-type attributes.
    //
    this.onError = my_onError;
    this.SetExitCodeAndThrowException = my_SetExitCodeAndThrowException;
    this.SetExitCode = my_SetExitCode;
    this.StripAnyEnclosingQuotes = my_StripAnyEnclosingQuotes;
    this.GetValueForFlag = my_GetValueForFlag;
    this.ParseParamStartingAt = my_ParseParamStartingAt;
    this.ParseInArgs = my_ParseInArgs;
    this.IsInArray = my_IsInArray;
    this.SetupDefaultLog = my_SetupDefaultLog;
    this.CleanupDefaultLog = my_CleanupDefaultLog;
    this.Render = my_Render;
    this.ReallyRender = my_ReallyRender;
    this.GetFirstQueuedRQItemWithName = my_GetFirstQueuedRQItemWithName;
    this.AddCompToRenderQueue = my_AddCompToRenderQueue;
    this.EstablishAsOnlyQueuedItem = my_EstablishAsOnlyQueuedItem;
    this.SetLogPerFrameInfoInRQ = my_SetLogPerFrameInfoInRQ;
    this.CloseProjectIfDesired = my_CloseProjectIfDesired;
    this.SaveAndSetRenderSoundSetting = my_SaveAndSetRenderSoundSetting;
    this.RestoreRenderSoundSetting = my_RestoreRenderSoundSetting;
    this.IsSavePrefsArgGiven = my_IsSavePrefsArgGiven;
}

var gAECommandLineRenderer = new AECommandLineRenderer();
`
