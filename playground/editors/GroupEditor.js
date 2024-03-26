import { Loader } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON, onValidType } from '../NodeEditorUtils.js';
import { GroupInputEditor } from './GroupInputEditor.js';
import { GroupOutputEditor } from './GroupOutputEditor.js';
import { GroupNodeEditor } from '../NodeEditor.js';
import { setOutputAestheticsFromType } from '../DataTypeLib.js';
import { ClassLib } from '../NodeEditorLib.js';

export class GroupEditor extends BaseNodeEditor {

	constructor( groupPrototype ) {

		super( 'Group', null, 350 );

		this.groupPrototype = groupPrototype;

		this.inputEditor = null;
		this.inputElementsJSON = null;
		this.outputEditor = null;

	}

	setEditor( editor ) {

		super.setEditor( editor );

		if ( editor !== null ) {

			this.update();

		}

	}

	update() {

		this.setName( this.groupPrototype.groupName );

		this.nodeEditorJSON = this.groupPrototype.createNodeEditorJSON();

		if ( !this.nodeEditorJSON ) {

			this.invalidate();
			return;

		}

		const editor = this.editor;

		if ( !this.nodeEditor ) {

			this.nodeEditor = new GroupNodeEditor( editor.scene, editor.renderer, editor.composer, editor );

		}

		const loader = new Loader( Loader.OBJECTS );
		const json = loader.parse( this.nodeEditorJSON , ClassLib );

		this.nodeEditor.loadJSON( json );

		this.setInputEditor( this.nodeEditor.canvas.nodes.find( ( node ) => node instanceof GroupInputEditor ) );
		this.setOutputEditor( this.nodeEditor.canvas.nodes.find( ( node ) => node instanceof GroupOutputEditor ) );

	}

	setInputEditor( editor ) {

		this.inputEditor = editor;

		if ( editor ) {

			this.inputEditor.attachGroupEditor( this );

		}

		this.invalidate();

	}

	setOutputEditor( editor ) {

		this.outputEditor = editor;

		if ( editor ) {

			this.outputEditor.attachGroupEditor( this );

		}

		this.invalidate();

	}

	setOutput( type, value ) {

		this.value = value;
		setOutputAestheticsFromType( this.title, type );

		this.invalidate();

	}

	addInputFromJSON( json ) {
		// JSON layout: { id: <id>, name: <name>, type: <type> }
		const { id, name, type } = json;

		const { element, inputNode } = createElementFromJSON( {
			name: name,
			inputType: type
		} );

		// there has to be a corresponding field in the inputEditor elements
		const updateInput = () => {

			element.setEnabledInputs( ! element.getLinkedObject() );

			if ( this.inputEditor ) {

				const inputEditorElement = this.inputEditor.elements.find( ( obj ) => obj.attributeID == id );
				if ( inputEditorElement ) {
					
					inputEditorElement.attributeValue = element.getLinkedObject() ?? inputNode;

					// only invalidate the specific element we are changing
					inputEditorElement.dispatchEvent( new Event( 'connect' ) );

				}

			}

		};

		element.onConnect( () => updateInput(), true );

		// this is required for *MaterialEditors to get updated
		element.addEventListener( 'changeInput', () => updateInput() );

		// we have to set this before adding the element such that it only accepts the specific type.
		this.onValidElement = onValidType( type );
		this.add( element );

		updateInput();

	}

	setInputs( elements ) {

		if ( JSON.stringify( elements ) === JSON.stringify( this.inputElementsJSON ) ) {

			this.elements.forEach( ( element ) => {
	
				element.dispatchEvent( new Event( 'connect' ) );
	
			} );

			return;
		}

		this.clearLayout();

		elements.forEach( ( element ) => {

			this.addInputFromJSON( element );

		} );

		this.inputElementsJSON = elements;
	}

	clearLayout() {

		this.currentElementID = 0;

		for ( const element of this.elements.concat() ) {

			if ( element !== this.buttonElement && element !== this.title ) {

				this.remove( element );

			}

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.inputElementsJSON = this.inputElementsJSON;

	}

	deserialize( data ) {

		this.setInputs( data.inputElementsJSON || JSON.parse( '[]' ) );

		super.deserialize( data );

	}
}
