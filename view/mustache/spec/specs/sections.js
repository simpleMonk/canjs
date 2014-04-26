steal('./spec',function(){ MUSTACHE_SPECS.push({name:'sections', data: {"overview":"Section tags and End Section tags are used in combination to wrap a section\nof the template for iteration\n\nThese tags' content MUST be a non-whitespace character sequence NOT\ncontaining the current closing delimiter; each Section tag MUST be followed\nby an End Section tag with the same content within the same section.\n\nThis tag's content names the data to replace the tag.  Name resolution is as\nfollows:\n  1) Split the name on periods; the first part is the name to resolve, any\n  remaining parts should be retained.\n  2) Walk the context stack from top to bottom, finding the first context\n  that is a) a hash containing the name as a key OR b) an object responding\n  to a method with the given name.\n  3) If the context is a hash, the data is the value associated with the\n  name.\n  4) If the context is an object and the method with the given name has an\n  arity of 1, the method SHOULD be called with a String containing the\n  unprocessed contents of the sections; the data is the value returned.\n  5) Otherwise, the data is the value returned by calling the method with\n  the given name.\n  6) If any name parts were retained in step 1, each should be resolved\n  against a context stack containing only the result from the former\n  resolution.  If any part fails resolution, the result should be considered\n  falsey, and should interpolate as the empty string.\nIf the data is not of a list type, it is coerced into a list as follows: if\nthe data is truthy (e.g. `!!data == true`), use a single-element list\ncontaining the data, otherwise use an empty list.\n\nFor each element in the data list, the element MUST be pushed onto the\ncontext stack, the section MUST be rendered, and the element MUST be popped\noff the context stack.\n\nSection and End Section tags SHOULD be treated as standalone when\nappropriate.\n","tests":[{"name":"Truthy","desc":"Truthy sections should have their contents rendered.","data":{"boolean":true},"template":"\"{{#boolean}}This should be rendered.{{/boolean}}\"","expected":"\"This should be rendered.\""},{"name":"Falsey","desc":"Falsey sections should have their contents omitted.","data":{"boolean":false},"template":"\"{{#boolean}}This should not be rendered.{{/boolean}}\"","expected":"\"\""},{"name":"Context","desc":"Objects and hashes should be pushed onto the context stack.","data":{"context":{"name":"Joe"}},"template":"\"{{#context}}Hi {{name}}.{{/context}}\"","expected":"\"Hi Joe.\""},{"name":"Deeply Nested Contexts","desc":"All elements on the context stack should be accessible.","data":{"a":{"one":1},"b":{"two":2},"c":{"three":3},"d":{"four":4},"e":{"five":5}},"template":"{{#a}}\n{{one}}\n{{#b}}\n{{one}}{{two}}{{one}}\n{{#c}}\n{{one}}{{two}}{{three}}{{two}}{{one}}\n{{#d}}\n{{one}}{{two}}{{three}}{{four}}{{three}}{{two}}{{one}}\n{{#e}}\n{{one}}{{two}}{{three}}{{four}}{{five}}{{four}}{{three}}{{two}}{{one}}\n{{/e}}\n{{one}}{{two}}{{three}}{{four}}{{three}}{{two}}{{one}}\n{{/d}}\n{{one}}{{two}}{{three}}{{two}}{{one}}\n{{/c}}\n{{one}}{{two}}{{one}}\n{{/b}}\n{{one}}\n{{/a}}\n","expected":"1\n121\n12321\n1234321\n123454321\n1234321\n12321\n121\n1\n"},{"name":"List","desc":"Lists should be iterated; list items should visit the context stack.","data":{"list":[{"item":1},{"item":2},{"item":3}]},"template":"\"{{#list}}{{item}}{{/list}}\"","expected":"\"123\""},{"name":"Empty List","desc":"Empty lists should behave like falsey values.","data":{"list":[]},"template":"\"{{#list}}Yay lists!{{/list}}\"","expected":"\"\""},{"name":"Doubled","desc":"Multiple sections per template should be permitted.","data":{"bool":true,"two":"second"},"template":"{{#bool}}\n* first\n{{/bool}}\n* {{two}}\n{{#bool}}\n* third\n{{/bool}}\n","expected":"* first\n* second\n* third\n"},{"name":"Nested (Truthy)","desc":"Nested truthy sections should have their contents rendered.","data":{"bool":true},"template":"| A {{#bool}}B {{#bool}}C{{/bool}} D{{/bool}} E |","expected":"| A B C D E |"},{"name":"Nested (Falsey)","desc":"Nested falsey sections should be omitted.","data":{"bool":false},"template":"| A {{#bool}}B {{#bool}}C{{/bool}} D{{/bool}} E |","expected":"| A  E |"},{"name":"Context Misses","desc":"Failed context lookups should be considered falsey.","data":{},"template":"[{{#missing}}Found key 'missing'!{{/missing}}]","expected":"[]"},{"name":"Implicit Iterator - String","desc":"Implicit iterators should directly interpolate strings.","data":{"list":["a","b","c","d","e"]},"template":"\"{{#list}}({{.}}){{/list}}\"","expected":"\"(a)(b)(c)(d)(e)\""},{"name":"Implicit Iterator - Integer","desc":"Implicit iterators should cast integers to strings and interpolate.","data":{"list":[1,2,3,4,5]},"template":"\"{{#list}}({{.}}){{/list}}\"","expected":"\"(1)(2)(3)(4)(5)\""},{"name":"Implicit Iterator - Decimal","desc":"Implicit iterators should cast decimals to strings and interpolate.","data":{"list":[1.1,2.2,3.3,4.4,5.5]},"template":"\"{{#list}}({{.}}){{/list}}\"","expected":"\"(1.1)(2.2)(3.3)(4.4)(5.5)\""},{"name":"Dotted Names - Truthy","desc":"Dotted names should be valid for Section tags.","data":{"a":{"b":{"c":true}}},"template":"\"{{#a.b.c}}Here{{/a.b.c}}\" == \"Here\"","expected":"\"Here\" == \"Here\""},{"name":"Dotted Names - Falsey","desc":"Dotted names should be valid for Section tags.","data":{"a":{"b":{"c":false}}},"template":"\"{{#a.b.c}}Here{{/a.b.c}}\" == \"\"","expected":"\"\" == \"\""},{"name":"Dotted Names - Broken Chains","desc":"Dotted names that cannot be resolved should be considered falsey.","data":{"a":{}},"template":"\"{{#a.b.c}}Here{{/a.b.c}}\" == \"\"","expected":"\"\" == \"\""},{"name":"Surrounding Whitespace","desc":"Sections should not alter surrounding whitespace.","data":{"boolean":true},"template":" | {{#boolean}}\t|\t{{/boolean}} | \n","expected":" | \t|\t | \n"},{"name":"Internal Whitespace","desc":"Sections should not alter internal whitespace.","data":{"boolean":true},"template":" | {{#boolean}} {{! Important Whitespace }}\n {{/boolean}} | \n","expected":" |  \n  | \n"},{"name":"Indented Inline Sections","desc":"Single-line sections should not alter surrounding whitespace.","data":{"boolean":true},"template":" {{#boolean}}YES{{/boolean}}\n {{#boolean}}GOOD{{/boolean}}\n","expected":" YES\n GOOD\n"},{"name":"Standalone Lines","desc":"Standalone lines should be removed from the template.","data":{"boolean":true},"template":"| This Is\n{{#boolean}}\n|\n{{/boolean}}\n| A Line\n","expected":"| This Is\n|\n| A Line\n"},{"name":"Indented Standalone Lines","desc":"Indented standalone lines should be removed from the template.","data":{"boolean":true},"template":"| This Is\n  {{#boolean}}\n|\n  {{/boolean}}\n| A Line\n","expected":"| This Is\n|\n| A Line\n"},{"name":"Standalone Line Endings","desc":"\"\\r\\n\" should be considered a newline for standalone tags.","data":{"boolean":true},"template":"|\r\n{{#boolean}}\r\n{{/boolean}}\r\n|","expected":"|\r\n|"},{"name":"Standalone Without Previous Line","desc":"Standalone tags should not require a newline to precede them.","data":{"boolean":true},"template":"  {{#boolean}}\n#{{/boolean}}\n/","expected":"#\n/"},{"name":"Standalone Without Newline","desc":"Standalone tags should not require a newline to follow them.","data":{"boolean":true},"template":"#{{#boolean}}\n/\n  {{/boolean}}","expected":"#\n/\n"},{"name":"Padding","desc":"Superfluous in-tag whitespace should be ignored.","data":{"boolean":true},"template":"|{{# boolean }}={{/ boolean }}|","expected":"|=|"}],"__ATTN__":"Do not edit this file; changes belong in the appropriate YAML file."}});})