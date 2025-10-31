import { ContinuousInputForm } from "./continuous-inputs/ContinuousInputForm";

export const App = () => {
	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-md space-y-4">
				<h1 className="text-2xl font-bold text-gray-800">
					Frontend Interview Starter
				</h1>
				<p className="text-gray-600">
					This is a minimal React + Vite + Tailwind CSS + TypeScript starter
					template.
				</p>
				<ContinuousInputForm />
			</div>
		</div>
	);
};
