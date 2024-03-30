import { Element, ButtonInput, StringInput, SelectInput } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { inputNodeLib } from '../NodeEditorUtils.js';
import { nameToTypeList, setOutputAestheticsFromType } from '../DataTypeLib.js';

export class GroupInputEditor extends BaseNodeEditor {

	constructor() {

		super( 'Group Inputs', null, 300 );

		const button = new ButtonInput( 'Add Input' ).onClick( () => {

			this.addParameterFromJSON({ name: 'unnamed input', type: 'float', });
			this.updateGroupEditor();

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
		this.updateGroupEditor();

	}

	addParameterFromJSON( json ) {
		// JSON layout: { id?: <id>?, name: <name>, type: <type> }
		const { name, type } = json;
		const id = json.id ?? this.currentElementID;

		// always get the highest ID to prevent clashes
		this.currentElementID = ( json.id > this.currentElementID ? json.id : this.currentElementID ) + 1;

		const nameInput = new StringInput( name ).onChange( () => {

			element.attributeName = nameInput.getValue();
			this.updateGroupEditor();

		} );

		const typeInput = new SelectInput().onChange( () => {

			element.attributeType = typeInput.getValue();
			element.attributeValue = element.attributeType in inputNodeLib ? inputNodeLib[ element.attributeType ]() : null;

			setOutputAestheticsFromType( element, element.attributeType );

			// TODO: Reset connection; Sadly, due to the current architecture, it's not possible to only reset if the connection is invalid)
			// element.dispose();

			this.updateGroupEditor();

		} );

		typeInput.setOptions( nameToTypeList );

		const removeButton = new ButtonInput( 'Remove ' ).setIcon( 'ti ti-trash' ).onClick( () => {

			element.dispose();

			this.remove( element );
			this.updateGroupEditor();

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

		element.setObjectCallback( getObjectCallback );

		this.add( element );

		return element;

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

	updateGroupEditor() {

		if ( this.parentGroupEditor ) {

			this.parentGroupEditor.updateInputs( this.generateElementsJSON() );

		}

	}

	invalidate() {

		super.invalidate();

		for ( const element of this.elements ) {

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

		const elementsJSON = data.elementsJSON || JSON.parse( '[]' );

		for ( const element of elementsJSON ) {

			this.addParameterFromJSON( element );

		}

		super.deserialize( data );

	}
}
