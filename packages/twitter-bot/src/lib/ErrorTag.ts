class ErrorTag extends Error {
	hasTag: boolean;
	constructor(error) {
		super(error);
		this.hasTag = true;
	}
}

export default ErrorTag;
