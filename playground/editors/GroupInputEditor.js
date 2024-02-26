import { Element, ButtonInput, StringInput, SelectInput } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { inputNodeLib } from '../NodeEditorUtils.js';
import { setOutputAestheticsFromType } from '../DataTypeLib.js';

export class GroupInputEditor extends BaseNodeEditor {

	constructor() {

		super( 'Group Inputs', null, 300 );

		const button = new ButtonInput( "Add Input" ).onClick( () => {

			this.addParameterFromJSON({ name: "unnamed input", type: "float", });
			this.requestGroupPrototypeUpdate();
	
		} );

		this.buttonElement = new Element().add( button );

		this.add( this.buttonElement );

		this.currentElementID = 0;
	}

    isRemovable() {

        return false;

    }

	attachGroupEditor( editor ) {

		this.parentGroupEditor = editor;
		this.requestGroupPrototypeUpdate();

	}

	addParameterFromJSON( json ) {
		// TODO: maybe, we have to outsource this element into its own class later. We'll see.
		// JSON layout: { id?: <id>?, name: <name>, type: <type> }
		const { name, type } = json;
		const id = json.id ?? this.currentElementID;

		this.currentElementID = (json.id > this.currentElementID ? json.id : this.currentElementID ) + 1; // TODO: always get the highest ID to prevent clashes

		const nameInput = new StringInput( name ).onChange( () => {

			element.attributeName = nameInput.getValue();
			this.requestGroupPrototypeUpdate();

		} );
	
		const types = [
			{ name: "string", value: "string" },
			{ name: "float", value: "float" },
			{ name: "vec2", value: "vec2" },
			{ name: "vec3", value: "vec3" },
			{ name: "vec4", value: "vec4" },
			{ name: "color", value: "color" },
			{ name: "anything", value: "node" }
		];

		const typeInput = new SelectInput().onChange( () => {

			element.attributeType = typeInput.getValue();
			element.attributeValue = element.attributeType in inputNodeLib ? inputNodeLib[ element.attributeType ]() : null;

			setOutputAestheticsFromType( element, type );

			// TODO: disconnect if required

			this.requestGroupPrototypeUpdate();

		} );

		typeInput.setOptions( types );

		const removeButton = new ButtonInput( "Remove " ).setIcon( 'ti ti-trash' ).onClick( () => {

			this.remove( element );
			// TODO: we need to remove existing connections
			this.requestGroupPrototypeUpdate();

		} );

		const element = new Element().add( nameInput )
									 .add( typeInput )
									 .add( removeButton );

		element.attributeName = name;
		element.attributeID = id;

		typeInput.setValue( type );

		const getObjectCallback = () => {

			return element.attributeValue;

		};

		element.setObjectCallback(getObjectCallback);

		this.add( element );

		return element;

	}

	useLayout( elements ) {

		this.clearLayout();

		for ( const element of elements ) {

			this.addParameterFromJSON( element );

		}

		this.elementsJSON = elements;

		this.requestGroupPrototypeUpdate();
	}

	clearLayout() {

		this.currentElementID = 0;

		for ( const element of this.elements.concat() ) {

			if ( element !== this.buttonElement && element !== this.title ) {

				this.remove( element );

			}

		}

	}

	generateElementsJSON() {

		var elements = []

		for ( const element of this.elements.concat() ) {

			if ( element !== this.buttonElement && element !== this.title ) {

				elements.push( { name: element.attributeName, type: element.attributeType, id: element.attributeID } );

			}

		}

		return elements;

	}

	requestGroupPrototypeUpdate() {

		if (this.parentGroupEditor) this.parentGroupEditor.setInputs( this.generateElementsJSON() );

	}

	invalidate() {

		super.invalidate();

		for ( const element of this.elements.concat() ) {

			if ( element !== this.buttonElement && element !== this.title ) {

				element.dispatchEvent( new Event( 'connect' ) );

			}

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.elementsJSON = this.generateElementsJSON();

	}

	deserialize( data ) {

		this.useLayout( data.elementsJSON || JSON.parse( '[]' ), true );

		super.deserialize( data );

	}
}
