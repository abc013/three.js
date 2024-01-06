import { Element, ButtonInput, StringInput } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { getColorFromType, inputNodeLib } from '../NodeEditorUtils.js';

export class GroupInputEditor extends BaseNodeEditor {

	constructor(parentGroupEditor) {

		super( 'Group Inputs', null, 300 );

        this.parentGroupEditor = parentGroupEditor;

		const button = new ButtonInput( "Add Input" ).onClick( () => {

			this.addParameterFromJSON({ name: "unnamed input", type: "float", });
			this.requestGroupPrototypeUpdate();
	
		} );

		this.buttonElement = new Element().add( button );

		this.add( this.buttonElement );

		this.currentElementID = 0;
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
	
		const typeInput = new StringInput( type ).setReadOnly( true ).onChange( () => {

			element.typeInput = typeInput.getValue();
			element.setOutputColor( getColorFromType( type ) );
			element.setOutput( 1 );
			this.requestGroupPrototypeUpdate();

		} ); // TODO: make an options thing out of it

		const removeButton = new ButtonInput( "Remove " ).setIcon( 'ti ti-trash' ).onClick( () => {

			this.remove( element );
			// TODO: we need to remove existing connections
			this.requestGroupPrototypeUpdate();

		} );

		const element = new Element().add( nameInput )
                                     .add( typeInput )
							         .add( removeButton );

		element.attributeName = name;
		element.attributeType = type;
		element.attributeID = id; // TODO: necessary? might come in handy when saving?

		element.setOutputColor( getColorFromType( type ) );
		element.setOutput( 1 );

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

		this.remove( this.buttonElement );
		this.add( this.buttonElement );

		this.elementsJSON = elementsJSON;

		this.updateOutputConnection();

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
		console.log("[NodeIn] Group Prototype needs refresh!");

		this.parentGroupEditor.setInputs( this.generateElementsJSON() );
	}

	invalidate() {

		super.invalidate();

		for ( const element of this.elements.concat() ) {

			if ( element !== this.buttonElement && element !== this.title ) {

				element.dispatchEvent( new Event( 'connect' ) );

			}

		}

	}
}
