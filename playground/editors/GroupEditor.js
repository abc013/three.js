import { Loader } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';
import { GroupInputEditor } from './GroupInputEditor.js';
import { GroupOutputEditor } from './GroupOutputEditor.js';
import { NodeEditor } from '../NodeEditor.js';
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

		if (!this.nodeEditorJSON) {

			this.invalidate();
			return;

		}

		const editor = this.editor;

		if ( !this.nodeEditor ) {

			this.nodeEditor = new NodeEditor( editor.scene, editor.renderer, editor.composer, true, editor );

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
			this.updateOutputs();

		}

		this.invalidate();

	}

	updateOutputs() {

		this.value = this.outputEditor.output;
		this.updateOutputConnection();
		this.invalidate();

	}

	addInputFromJSON( json ) {
		// JSON layout: { id: <id>, name: <name>, type: <type> }
		const { id, name, type } = json;

		const { element, inputNode } = createElementFromJSON( {
			name: name,
			inputType: type,
			inputConnection: false
		} );

		element.setInput(1); // TODO: somehow, using inputConnection == true doesn't work, but this does...

		// there has to be a corresponding field in the inputEditor elements
		const inputEditorElement = !this.inputEditor ? null : this.inputEditor.elements.find( ( obj ) => obj.attributeID == id );

		const updateInput = () => {

			element.setEnabledInputs( ! element.getLinkedObject() );
			if (inputEditorElement) inputEditorElement.attributeValue = element.getLinkedObject() ?? inputNode;

			if (this.inputEditor) this.inputEditor.invalidate();

		};

		element.onConnect( () => updateInput(), true );
		element.addEventListener( 'changeInput', () => this.invalidate() );

		this.add( element );

		updateInput();
	}

	setInputs( elements ) {

		this.clearLayout();

		elements.forEach( (element) => {

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
