export interface ContinuousInput {
	id: number;
	name: string;
	unit: string;
	precision: number;
	min: string;
	max: string;
	is_discrete: boolean;
	step_size?: string;
}

const example: ContinuousInput = {
	id: 1,
	name: "Temperature",
	unit: "°C",
	precision: 2,
	min: "-100.00",
	max: "100.00",
	is_discrete: true,
	step_size: "0.05",
};
