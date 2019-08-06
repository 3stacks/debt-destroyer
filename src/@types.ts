import { IDebt } from './components/app/app';

export interface IDialogProps {
	isOpen: boolean;
	onCloseRequested: () => void;
}

export interface IClasses {
	[className: string]: any;
}

export interface IError {
	id: string;
	fields: IErrorFields;
}

export type IErrorFields = Map<
	keyof IDebt,
	{
		error: boolean;
		message: string;
	}
>;
