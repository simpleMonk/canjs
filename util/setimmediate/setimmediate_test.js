steal("can/util/setimmediate", function(setImmediate){
	module("can/util/setimmediate");

	test("setImmediate calls the callback function asynchronously", function() {
		var test = false;

		setImmediate(function() {
			// The flag should have been set to true
			equal(test, true, "Flag is swapped to the other value");
			start();
		});

		// Change the flag
		test = true;

		stop();
	});

});
