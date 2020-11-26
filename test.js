async function doubleIfEven(a) {
	if (a % 2 == 0) {
		return a*2;
	} else {
		throw new Error("odd");
	}
}

(async function() {
	try {
		const b = await doubleIfEven(1);
		console.log("b:", b);
	} catch(err) {
		console.log("caught");
		console.log(err.message);
		//throw err;
	}
})();
