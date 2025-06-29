const escodegen = require('escodegen')
const esprima = require('esprima')
const reservedPropertiesHelper = require('./reservedPropertiesHelper')
const valueAssignmentHelper = require('./valueAssignmentHelper')
const variableDeclarationHelper = require('./variableDeclarationHelper')

var options = {
	tokens: true,
	range: true
};

function correctElseToken(str){
	var regElse = /(\/\/)?(.*) else /g;
	return str.replace(regElse,'$1$2\n$1 else ');
}

function correctKhanyu(str){
	var easeRegex = /Khanyu\s[0-9. ]+/;
	if (easeRegex.test(str)) {
		str = str.replace('key(1)[1];', 'key(1)[1].length;');
		str = str.replace('key(1)[2];', 'key(1)[2].length;');
	}
	return str;
}

function correctEaseAndWizz(str){
	var easeRegex = /Ease and Wizz\s[0-9. ]+:/;
	if (easeRegex.test(str)) {
		str = str.replace('key(1)[1];', 'key(1)[1].length;');
		str = str.replace('key(1)[2];', 'key(1)[2].length;');
	}
	return str;
}

function fixThrowExpression(str){
	var throwRegex = /(throw (["'])(?:(?=(\\?))\3[\S\s])*?\2)\s*([^;])/g;
	return str.replace(throwRegex, '$1;\n$4');
}

function renameNameProperty(str){
	var regName = /([.'"])name([\s'";.\)\]])/g;
	return str.replace(regName,'$1_name$2');
}

function searchOperations(body) {
	var i, len = body.length;
	for (i = 0; i < len; i += 1) {
		if (body[i].type === 'ExpressionStatement') {
			handleExpressionStatement(body[i]);
		} else if (body[i].type === 'IfStatement') {
			handleIfStatement(body[i]);
		} else if (body[i].type === 'FunctionDeclaration') {
			handleFunctionDeclaration(body[i]);
		} else if (body[i].type === 'WhileStatement') {
			handleWhileStatement(body[i]);
		} else if (body[i].type === 'ForStatement') {
			handleForStatement(body[i]);
		} else if (body[i].type === 'VariableDeclaration') {
			handleVariableDeclaration(body[i]);
		} else if (body[i].type === 'ReturnStatement') {
			handleReturnStatement(body[i]);
		} else if (body[i].type === 'TryStatement') {
			handleTryStatement(body[i]);
		} else if (body[i].type === 'SwitchStatement') {
			handleSwitchStatement(body[i]);
		} else {
		}
	}
}

function getBinaryElement(element) {
	switch (element.type) {
		case "Literal":
		case "Identifier":
			return element;
		case "CallExpression":
			handleCallExpression(element);
			return element;
		case "BinaryExpression":
			return convertBinaryExpression(element);
		case "UnaryExpression":
			return convertUnaryExpression(element);
		case "MemberExpression":
			handleMemberExpression(element);
			return element;
		case "UpdateExpression":
			return element;
		default:
			return element;
	}
}

function getOperatorName(operator) {
	switch (operator) {
		case '+':
			return '$bm_sum';
		case '-':
			return '$bm_sub';
		case '*':
			return '$bm_mul';
		case '/':
			return '$bm_div';
		case '%':
			return '$bm_mod';
		default:
			return '$bm_sum';

	}
}

function isOperatorTransformable(operator){
	switch(operator){
		case '+':
		case '-':
		case '*':
		case '/':
		case '%':
			return true;
		default:
			return false;
	}
}

function convertBinaryExpression(expression) {
	if (expression.left.type === 'Literal' && expression.right.type === 'Literal') {
		return expression;
	}
	var callStatementOb;
	if(expression.operator === 'instanceof' && expression.right.type === 'Identifier' && expression.right.name === 'Array') {
		callStatementOb = {
			'arguments': [
				getBinaryElement(expression.left)
			],
			type: "CallExpression",
			callee: {
				name: '$bm_isInstanceOfArray',
				type: 'Identifier'
			}
		};
	} else if(!isOperatorTransformable(expression.operator)){
		if(expression.left.type === 'BinaryExpression') {
			expression.left = getBinaryElement(expression.left);
		}
		if(expression.right.type === 'BinaryExpression') {
			expression.right = getBinaryElement(expression.right);
		}
		callStatementOb = expression;
	} else {
		callStatementOb = {
			'arguments': [
				getBinaryElement(expression.left),
				getBinaryElement(expression.right)
			],
			type: "CallExpression",
			callee: {
				name: getOperatorName(expression.operator),
				type: 'Identifier'
			}
		};
	}
	return callStatementOb;
}

function convertUnaryExpression(expression){
	if(expression.operator === '-' && expression.argument.type !== 'Literal'){
		var callStatementOb = {
			'arguments': [
				getBinaryElement(expression.argument)
			],
			type: "CallExpression",
			callee: {
				name: '$bm_neg',
				type: 'Identifier'
			}
		};
		return callStatementOb;
	}
	return expression;
}

function handleMemberExpression(expression) {
	if (expression.property.type === 'BinaryExpression') {
		expression.property = convertBinaryExpression(expression.property);
	} else if (expression.property.type === 'UnaryExpression') {
		expression.property = convertUnaryExpression(expression.property);
	} else if (expression.property.type === 'CallExpression') {
		handleCallExpression(expression.property);
	}
	if (expression.object){
		if (expression.object.type === 'BinaryExpression') {
			expression.object = convertBinaryExpression(expression.property);
		} else if (expression.object.type === 'UnaryExpression') {
			expression.object = convertUnaryExpression(expression.property);
		} else if (expression.object.type === 'CallExpression') {
			handleCallExpression(expression.object);
		}
	}
}

function handleCallExpression(expression) {
	var args = expression['arguments'];
	handleSequenceExpressions(args);
	if(expression.callee.name === 'eval'){
		var wrappingNode = {
			type: 'MemberExpression',
			computed: true,
			object: {
				type: 'ArrayExpression',
				elements: [
					args[0]
				]

			},
			property: {
				value: 0,
				type: 'Literal',
				raw: '0'
			}
		}
		args[0] = wrappingNode
	} else if (expression.callee.type === 'FunctionExpression') {
		handleFunctionDeclaration(expression.callee);
	}
}

function handleIfStatement(ifStatement) {
	if(ifStatement.test.type === 'BinaryExpression') {
		ifStatement.test = convertBinaryExpression(ifStatement.test);
	}
	if (ifStatement.consequent) {
		if (ifStatement.consequent.type === 'BlockStatement') {
			searchOperations(ifStatement.consequent.body);
		} else if (ifStatement.consequent.type === 'ExpressionStatement') {
			handleExpressionStatement(ifStatement.consequent);
		} else if (ifStatement.consequent.type === 'ReturnStatement') {
			handleReturnStatement(ifStatement.consequent);
		}
	}
	if (ifStatement.alternate) {
		if (ifStatement.alternate.type === 'IfStatement') {
			handleIfStatement(ifStatement.alternate);
		} else if (ifStatement.alternate.type === 'BlockStatement') {
			searchOperations(ifStatement.alternate.body);
		} else if (ifStatement.alternate.type === 'ExpressionStatement') {
			handleExpressionStatement(ifStatement.alternate);
		}
	}
}

function handleTryStatement(tryStatement) {
	if (tryStatement.block) {
		if (tryStatement.block.type === 'BlockStatement') {
			searchOperations(tryStatement.block.body);
		}
	}
	if (tryStatement.handler) {
		if (tryStatement.handler.body.type === 'BlockStatement') {
			searchOperations(tryStatement.handler.body.body);
		}
	}
}

function handleSwitchStatement(switchStatement) {
	var cases = switchStatement.cases;
	var i, len = cases.length;
	for(i = 0; i < len; i += 1) {
		searchOperations(cases[i].consequent);
	}
}

function handleWhileStatement(whileStatement) {
	if (whileStatement.body) {
		if (whileStatement.body.type === 'BlockStatement') {
			searchOperations(whileStatement.body.body);
		} else if (whileStatement.body.type === 'ExpressionStatement') {
			handleExpressionStatement(whileStatement.body);
		}
	}
	if (whileStatement.test) {
		if (whileStatement.test.type === 'MemberExpression') {
			handleMemberExpression(whileStatement.test);
		}
	}
}

function handleForStatement(forStatement) {
	if (forStatement.body) {
		if (forStatement.body.type === 'BlockStatement') {
			searchOperations(forStatement.body.body);
		} else if (forStatement.body.type === 'ExpressionStatement') {
			handleExpressionStatement(forStatement.body);
		}
	}
}

function handleReturnStatement(returnStatement) {
	if (returnStatement.argument) {
		returnStatement.argument = getBinaryElement(returnStatement.argument);
	}
}

function handleVariableDeclaration(variableDeclaration) {
	var declarations = variableDeclaration.declarations;
	var i, len = declarations.length;
	for (i = 0; i < len; i += 1) {
		if (declarations[i].init) {
			if (declarations[i].init.type === 'BinaryExpression') {
				declarations[i].init = convertBinaryExpression(declarations[i].init);
			} else if (declarations[i].init.type === 'UnaryExpression') {
				declarations[i].init = convertUnaryExpression(declarations[i].init);
			} else if (declarations[i].init.type === 'CallExpression') {
				handleCallExpression(declarations[i].init);
			} else if (declarations[i].init.type === 'ConditionalExpression') {
				handleConditionalExpression(declarations[i].init);
			} else if (declarations[i].init.type === 'LogicalExpression') {
				handleLogicalExpression(declarations[i].init);
			} else if (declarations[i].init.type === 'NewExpression') {
				handleNewExpression(declarations[i].init);
			} else if (declarations[i].init.type === 'ArrowFunctionExpression') {
				handleArrowFunctionExpression(declarations[i].init);
			} else {
				// console.log('UNHANDLED: ', declarations[i].init);
			}
		}
	}
}

function convertAssignmentToBinaryExpression(assignmentExpression) {
	var function_arguments = [];
	function_arguments.push(assignmentExpression.left);
	function_arguments.push(assignmentExpression.right)
	assignmentExpression.right = {
		type: 'CallExpression',
		arguments: function_arguments,
		callee: {name:getOperatorName(assignmentExpression.operator.substr(0,1)), type:'Identifier'}
	}
	assignmentExpression.operator = '=';
}

function handleAssignmentExpression(assignmentExpression) {
	if(assignmentExpression.operator === '+=' || assignmentExpression.operator === '-=') {
		convertAssignmentToBinaryExpression(assignmentExpression)
	}
	if(assignmentExpression.right){
		assignmentExpression.right = handleStatement(assignmentExpression.right);
	}
}

function handleLogicalExpression(logicalExpression) {
	if (logicalExpression.right){
		logicalExpression.right = handleStatement(logicalExpression.right);
	}

	if (logicalExpression.left){
		logicalExpression.left = handleStatement(logicalExpression.left);
	}
}

function handleStatement(statement) {
	if (statement.type === 'BinaryExpression') {
		statement = convertBinaryExpression(statement);
	} else if (statement.type === 'UnaryExpression') {
		statement = convertUnaryExpression(statement);
	} else if (statement.type === 'CallExpression') {
		handleCallExpression(statement);
	} else  if (statement.type === 'MemberExpression') {
		handleMemberExpression(statement);
	} else  if (statement.type === 'ConditionalExpression') {
		handleConditionalExpression(statement);
	} else  if (statement.type === 'ArrayExpression') {
		handleSequenceExpressions(statement.elements);
	} else  if (statement.type === 'FunctionExpression') {
		handleFunctionDeclaration(statement);
	} else  if (statement.type === 'LogicalExpression') {
		handleLogicalExpression(statement);
	}
	return statement;
}

function handleNewExpression(newExpression) {
	if (newExpression.callee.type === 'ClassExpression') {
		handleClassExpression(newExpression.callee);
	}
}

function handleArrowFunctionExpression(arrowFunctionExpression) {
	arrowFunctionExpression.body = handleStatement(arrowFunctionExpression.body);
}

function handleClassExpression(classExpression) {
	if (classExpression.body.type === 'ClassBody') {
		var body = classExpression.body.body;
		var i, len = body.length;
		for (i = 0; i < len; i += 1) {
			if (body[i].type === 'MethodDefinition'
				&& body[i].value.type === 'FunctionExpression'
			) {
				handleFunctionDeclaration(body[i].value);
			}
		}
	}
}

function handleConditionalExpression(conditionalExpression) {
	if(conditionalExpression.test.type === 'BinaryExpression') {
		conditionalExpression.test = convertBinaryExpression(conditionalExpression.test);
	}
	if(conditionalExpression.consequent){
		if (conditionalExpression.consequent.type === 'AssignmentExpression') {
			handleAssignmentExpression(conditionalExpression.consequent);
		} else if (conditionalExpression.consequent.type === 'BinaryExpression') {
			conditionalExpression.consequent = convertBinaryExpression(conditionalExpression.consequent);
		} else if (conditionalExpression.consequent.type === 'SequenceExpression') {
			handleSequenceExpressions(conditionalExpression.consequent.expressions);
		} else if (conditionalExpression.consequent.type === 'CallExpression') {
			handleCallExpression(conditionalExpression.consequent);
		} else if (conditionalExpression.consequent.type === 'LogicalExpression') {
			handleLogicalExpression(conditionalExpression.consequent);
		}
	}
	if (conditionalExpression.alternate){
		if (conditionalExpression.alternate.type === 'AssignmentExpression') {
			handleAssignmentExpression(conditionalExpression.alternate);
		} else if (conditionalExpression.alternate.type === 'BinaryExpression') {
			conditionalExpression.alternate = convertBinaryExpression(conditionalExpression.alternate);
		} else if (conditionalExpression.alternate.type === 'SequenceExpression') {
			handleSequenceExpressions(conditionalExpression.alternate.expressions);
		} else if (conditionalExpression.alternate.type === 'CallExpression') {
			handleCallExpression(conditionalExpression.alternate);
		} else if (conditionalExpression.alternate.type === 'LogicalExpression') {
			handleLogicalExpression(conditionalExpression.alternate);
		}
	}
}

function handleSequenceExpressions(expressions) {
	var i, len = expressions.length;
	for (i = 0; i < len; i += 1) {
		if (expressions[i].type === 'CallExpression') {
			handleCallExpression(expressions[i]);
		} else if (expressions[i].type === 'BinaryExpression') {
			expressions[i] = convertBinaryExpression(expressions[i]);
		} else if (expressions[i].type === 'UnaryExpression') {
			expressions[i] = convertUnaryExpression(expressions[i]);
		} else if (expressions[i].type === 'AssignmentExpression') {
			handleAssignmentExpression(expressions[i]);
		} else if (expressions[i].type === 'ConditionalExpression') {
			handleConditionalExpression(expressions[i]);
		} else if (expressions[i].type === 'MemberExpression') {
			handleMemberExpression(expressions[i]);
		} else  if (expressions[i].type === 'ArrayExpression') {
			handleSequenceExpressions(expressions[i].elements);
		} else  if (expressions[i].type === 'LogicalExpression') {
			handleLogicalExpression(expressions[i]);
		}
	}
}

function handleExpressionStatement(expressionStatement) {
	if (expressionStatement.expression.type === 'CallExpression') {
		handleCallExpression(expressionStatement.expression);
	} else if (expressionStatement.expression.type === 'BinaryExpression') {
		expressionStatement.expression = convertBinaryExpression(expressionStatement.expression);
	} else if (expressionStatement.expression.type === 'UnaryExpression') {
		expressionStatement.expression = convertUnaryExpression(expressionStatement.expression);
	} else if (expressionStatement.expression.type === 'AssignmentExpression') {
		handleAssignmentExpression(expressionStatement.expression);
	} else if (expressionStatement.expression.type === 'ConditionalExpression') {
		handleConditionalExpression(expressionStatement.expression);
	} else if (expressionStatement.expression.type === 'SequenceExpression') {
		handleSequenceExpressions(expressionStatement.expression.expressions);
	} else if (expressionStatement.expression.type === 'LogicalExpression') {
		handleLogicalExpression(expressionStatement.expression);
	}
}

function handleFunctionDeclaration(functionDeclaration) {
	if (functionDeclaration.body && functionDeclaration.body.type === 'BlockStatement') {
		searchOperations(functionDeclaration.body.body);
	}
}

function replaceOperations(body) {
	searchOperations(body);
}

function findExpressionStatementsWithAssignmentExpressions(body) {

	var i, len = body.length;
	var j, jLen;
	for(i = 0; i < len; i += 1) {
		if (body[i].type === 'ExpressionStatement') {
			if (body[i].expression.type === 'CallExpression') {
				jLen = body[i].expression.arguments.length;
				for (j = 0; j < jLen; j += 1) {
					if(body[i].expression.arguments[j].type === 'AssignmentExpression') {
						body[i].expression.arguments[j] = body[i].expression.arguments[j].right;
					}
				} 
			} else if (body[i].expression.type === 'AssignmentExpression') {
				handleAssignmentExpression(body[i].expression);
			} else if (body[i].expression.type === 'LogicalExpression') {
				handleLogicalExpression(body[i].expression);
			}
		} else if (body[i].type === 'FunctionDeclaration') {
			if (body[i].body && body[i].body.type === 'BlockStatement') {
				findExpressionStatementsWithAssignmentExpressions(body[i].body.body);
			}
		}
	}
}

function expressionIsConstant(expressionTree) {
	if(expressionTree.body.length === 1  && expressionTree.body[0].type === "ExpressionStatement") {
		if (expressionTree.body[0].expression) {
			if(expressionTree.body[0].expression.type === "ArrayExpression") {
				var i = 0, len = expressionTree.body[0].expression.elements.length;
				while(i < len) {
					if(expressionTree.body[0].expression.elements[i].type !== 'Literal') {
						return false;
					}
					i += 1;
				}
				return true;
			} else if(expressionTree.body[0].expression.type === "Literal") {
				return true;
			}
		}
	}
	return false;
}

function process(expressionStr) {
	expressionStr = correctEaseAndWizz(expressionStr);
	expressionStr = correctKhanyu(expressionStr);
	expressionStr = correctElseToken(expressionStr);
	expressionStr = fixThrowExpression(expressionStr);
	expressionStr = renameNameProperty(expressionStr);

	expressionStr = variableDeclarationHelper.searchUndeclaredVariables(expressionStr);
	var parsed = esprima.parse(expressionStr, options);
	if(expressionIsConstant(parsed)) {
		return {
			isStatic: true,
			text: eval(expressionStr), // eslint-disable-line
		}
	}
	var body = parsed.body;

	findExpressionStatementsWithAssignmentExpressions(body);
	if(expressionStr.indexOf("use javascript") === -1){
		replaceOperations(body);
	}
	
	//Replacing reserved properties like position, anchorPoint with __transform.position,  __transform.anchorPoint
	reservedPropertiesHelper.replaceProperties(body);
	
	valueAssignmentHelper.assignVariable(body);

	try {

		expressionStr = escodegen.generate(parsed);
		expressionStr = 'var $bm_rt;\n' + expressionStr;

		return {
			isStatic: false,
			text: expressionStr,
		};

		// returnOb.x = expressionStr;

	} catch(err) {
		return {
			isStatic: false,
			hasFailed: true,
			text: '',
		}
	}
}

module.exports = process
