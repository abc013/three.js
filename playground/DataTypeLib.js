export const typeToLengthLib = {
	// gpu
	string: 1,
	float: 1,
	bool: 1,
	vec2: 2,
	vec3: 3,
	vec4: 4,
	color: 4,
	mat2: 1,
	mat3: 1,
	mat4: 1,
	// cpu
	String: 1,
	Number: 1,
	Vector2: 2,
	Vector3: 3,
	Vector4: 4,
	Color: 4,
	// cpu: other stuff
	Material: 1,
	Object3D: 1,
	CodeNode: 1,
	Texture: 1,
	URL: 1,
	node: 1
};

export const defaultLength = 1;

export function getLengthFromType( type ) {

	return typeToLengthLib[ type ] || defaultLength;

}

export function getLengthFromNode( value ) {

	let type = getTypeFromNode( value );

	return getLengthFromType( type );

}


export const typeToColorLib = {
	// gpu
	string: '#ff0000',
	float: '#eeeeee',
	bool: '#00dd00',
	vec2: '#0000ff',
	vec3: '#0000ff',
	vec4: '#0000ff',
	color: '#00ffff',
	mat2: '#70d030',
	mat3: '#70d030',
	mat4: '#70d030',
	// cpu
	String: '#ff0000',
	Number: '#eeeeee',
	Vector2: '#0000ff',
	Vector3: '#0000ff',
	Vector4: '#0000ff',
	Color: '#00ffff',
	// cpu: other stuff
	Material: '#228b22',
	Object3D: '#00a1ff',
	CodeNode: '#ff00ff',
	Texture: '#ffa500',
	URL: '#ff0080',
	node: '#ff00ff'
};

export const defaultColor = '#777777';

export function getColorFromType( type ) {

	return typeToColorLib[ type ] || defaultColor;

}

export function getColorFromNode( value ) {

	let type = getTypeFromNode( value );

	return getColorFromType( type );

}

export function getTypeFromNode ( value ) {

	if ( value ) {

		if ( value.isMaterial ) return 'Material';

		return value.nodeType === 'ArrayBuffer' ? 'URL' : ( value.nodeType || getTypeFromValue( value.value ) );
	}

}

export function getTypeFromValue( value ) {

	if ( value && value.isScriptableValueNode ) value = value.value;
	if ( ! value ) return;

	if ( value.isNode && value.nodeType === 'string' ) return 'string';
	if ( value.isNode && value.nodeType === 'ArrayBuffer' ) return 'URL';

	for ( const type of Object.keys( typeToLengthLib ).reverse() ) {

		if ( value[ 'is' + type ] === true ) return type;

	}

}

export function getColorFromValue( value ) {

	const type = getTypeFromValue( value );

	return getColorFromType( type );

}

export function setInputAestheticsFromType( element, type ) {

	element.setInput( getLengthFromType( type ) );
	element.setInputColor( getColorFromType( type ) );

	return element;

}

export function setOutputAestheticsFromNode( element, node ) {

	if ( ! node ) {

		element.setOutput( 0 );

		return element;

	}

	let type = getTypeFromNode( node );

	if ( ! type ) {

		element.setOutput( 1 );

		return element;

	}

	element.setOutput( getLengthFromType( type ) );
	element.setOutputColor( getColorFromType( type ) );

	return element;

}