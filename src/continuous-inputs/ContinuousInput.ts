export interface ContinuousInput {
	id: number;
	name: string;
	unit: string;
	decimals: number;
	min: number;
	max: number;
	is_discrete: boolean;
	step?: number;
}

const example: ContinuousInput = {
	id: 1,
	name: "Temperature",
	unit: "°C",
	decimals: 2,
	min: -100,
	max: 100,
	is_discrete: false,
};
