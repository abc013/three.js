import { Element, SelectInput } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON, onValidNode } from '../NodeEditorUtils.js';
import { setInputAestheticsFromType } from '../DataTypeLib.js';

export class GroupOutputEditor extends BaseNodeEditor {

	constructor() {

		super( 'Group Output', null, 350 );
	
		const types = [
			{ name: "string", value: "string" },
			{ name: "float", value: "float" },
			{ name: "vec2", value: "vec2" },
			{ name: "vec3", value: "vec3" },
			{ name: "vec4", value: "vec4" },
			{ name: "color", value: "color" },
			{ name: "boolean", value: "bool" },
			{ name: "anything", value: "any" },
			{ name: "nothing", value: "null" }
		];

		const type = "any";

		const typeInput = new SelectInput().onChange( () => {

			this.generateInput( typeInput.getValue() );

		} );

		this.typeInput = typeInput;

		this.add( new Element().add( typeInput ) );

		typeInput.setOptions( types );
		typeInput.setValue( type );

	}

	generateInput( type ) {

		if ( type == this.inputType ) return;

		let linkedObject = null;
		if ( this.input ) {

			linkedObject = this.input.getLinkedElement();
			this.input.connect();

			this.remove( this.input );

			this.input = null;
			this.inputNode = null;

		}

		if ( type == "null" ) {

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
		element.onValid( onValidNode );


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

	}

	updateConnection() {

		if ( !this.input ) {

			this.output = null;

		} else {

			this.input.setEnabledInputs( ! this.input.getLinkedObject() );
			this.output = this.input.getLinkedObject() ?? this.inputNode;

		}

		if (this.parentGroupEditor) this.parentGroupEditor.updateOutputs();

	}

	invalidate() {

		super.invalidate();

		if (this.parentGroupEditor) this.parentGroupEditor.invalidate();

	}

}
