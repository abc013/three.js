import { Loader } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON, onValidType } from '../NodeEditorUtils.js';
import { GroupInputEditor } from './GroupInputEditor.js';
import { GroupOutputEditor } from './GroupOutputEditor.js';
import { GroupNodeEditor } from '../NodeEditor.js';
import { setInputAestheticsFromType, setOutputAestheticsFromType, setOutputAestheticsFromNode } from '../DataTypeLib.js';
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

		const nodeEditorJSON = this.groupPrototype.createNodeEditorJSON();

		if ( ! nodeEditorJSON ) {

			this.invalidate();
			return;

		}

		const editor = this.editor;

		if ( !this.nodeEditor ) {

			this.nodeEditor = new GroupNodeEditor( editor.scene, editor.renderer, editor.composer, editor );

		}

		const loader = new Loader( Loader.OBJECTS );
		const json = loader.parse( nodeEditorJSON , ClassLib );

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

		if ( value && ( type === 'node' || type === 'any' ) ) {

			setOutputAestheticsFromNode( this.title, value );

		} else {

			setOutputAestheticsFromType( this.title, type );

		}

		this.invalidate();

	}

	createInputFromJSON( json ) {
		// JSON layout: { id: <id>, name: <name>, type: <type> }
		const { id, name, type } = json;

		const { element, inputNode } = createElementFromJSON( {
			name: name,
			inputType: type,
			inputConnection: false
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

		// used for smart updating of the elements
		element.attributeID = id;

		element.onConnect( () => updateInput(), true );

		setInputAestheticsFromType( element, type );

		// this is required for *MaterialEditors to get updated
		element.addEventListener( 'changeInput', () => updateInput() );

		return element;

	}

	addInputFromJSON( json ) {
		// JSON layout: { id: <id>, name: <name>, type: <type> }
		const { type } = json;

		const element = this.createInputFromJSON( json );

		// if any is the type, we have to specifically set onValidElement for that
		this.onValidElement = onValidType( type == 'any' ? type : 'node' );
		this.add( element );

		element.dispatchEvent( new Event( 'connect' ) );

		return element;

	}

	updateInputs( elements ) {

		const currentElementsLength = this.inputElementsJSON ? this.inputElementsJSON.length : 0;

		var indexInElements = 0;

		for ( var i = 0; i < currentElementsLength; i++ ) {

			const currentJSON = this.inputElementsJSON[ i ];
			const newJSON = elements[ indexInElements ];

			var element = this.elements.find( ( element ) => { return element.attributeID == this.inputElementsJSON[ i ].id; } );

			if ( currentJSON.id == newJSON.id ) {

				indexInElements++;

				if ( currentJSON.type != newJSON.type || currentJSON.name != newJSON.name ) {

					const { type } = newJSON;
					const oldElement = element;

					element = this.createInputFromJSON( newJSON );

					// if any is the type, we have to specifically set onValidElement for that
					this.onValidElement = onValidType( type == 'any' ? type : 'node' );
					this.replace( oldElement, element );

				}

				element.dispatchEvent( new Event( 'connect' ) );

			} else {

				this.remove( element );

			}

		}

		for ( var i = indexInElements; i < elements.length; i++ ) {

			this.addInputFromJSON( elements[ i ] );

		}

		this.inputElementsJSON = elements;

	}

	serialize( data ) {

		super.serialize( data );

		data.inputElementsJSON = this.inputElementsJSON;

	}

	deserialize( data ) {

		this.updateInputs( data.inputElementsJSON || JSON.parse( '[]' ) );

		super.deserialize( data );

	}
}
