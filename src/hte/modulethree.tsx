export const ModuleThree = () => {
	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-md">
				<h1 className="text-2xl font-bold text-gray-800 mb-4">
					Module Three: Some tasks
				</h1>
				<p>1. Make this input controlled, and display its input here: _____</p>
				<input type="text" />
				<p>
					2. Make an async function that changes the input text to add "haha
					got'm" 2 seconds after user inputs into above field
				</p>
				<p>
					3. Tell me the difference between a form submit handler and an onClick
					handler
				</p>
				<p>4. Tell me when you'd use context/provider</p>
			</div>
		</div>
	);
};
