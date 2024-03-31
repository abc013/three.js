import { Element, SelectInput } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON, onValidType } from '../NodeEditorUtils.js';
import { nameToTypeList, setInputAestheticsFromType } from '../DataTypeLib.js';

export class GroupOutputEditor extends BaseNodeEditor {

	constructor() {

		super( 'Group Output', null, 350 );

		const types = [
			... nameToTypeList,
			{ name: 'nothing', value: 'null' }
		];

		const type = 'any';

		const typeInput = new SelectInput().onChange( () => {

			this.generateInput( typeInput.getValue() );

		} );

		this.typeInput = typeInput;

		this.add( new Element().add( typeInput ) );

		typeInput.setOptions( types );
		typeInput.setValue( type );

		this.cachedValue = null;

	}

	generateInput( type ) {

		let linkedObject = null;
		if ( this.input ) {

			linkedObject = this.input.getLinkedElement();
			this.input.connect();

			this.remove( this.input );

			this.input = null;
			this.inputNode = null;

		}

		if ( type == 'null' ) {

			this.updateConnection();
			return;

		}

		const { element, inputNode } = createElementFromJSON( {
			name: 'Output',
			inputType: type,
			inputConnection: false
		} );

		this.input = element;
		this.inputNode = inputNode;

		element.onConnect( () => { this.updateConnection() }, true );
		element.addEventListener( 'changeInput', () => { this.invalidate() } );

		setInputAestheticsFromType( element, type );

		// if any is the type, we have to specifically set onValidElement for that
		this.onValidElement = onValidType( type == 'any' ? type : 'node' );
		this.add( element );

		if ( linkedObject ) {

			element.connect( linkedObject );

		}

		this.updateConnection();

	}

	isRemovable() {

		return false;

	}

	attachGroupEditor( editor ) {

		this.parentGroupEditor = editor;
		this.updateConnection( true );

	}

	updateConnection( force = false ) {

		var value = null;

		if ( this.input ) {

			this.input.setEnabledInputs( ! this.input.getLinkedObject() );
			value = this.input.getLinkedObject() ?? this.inputNode;

		}

		// don't need to update the whole graph if value stays the same
		if ( this.cachedValue === value && ! force ) {

			return;

		}

		this.cachedValue = value;

		if ( this.parentGroupEditor ) {

			const type = this.typeInput.getValue();
			this.parentGroupEditor.setOutput( type, value );

		}

		this.invalidate();

	}

	invalidate() {

		super.invalidate();

		if ( this.parentGroupEditor ) this.parentGroupEditor.invalidate();

	}

}
