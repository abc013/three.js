import { LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';
import { GroupInputEditor } from './GroupInputEditor.js';
import { GroupOutputEditor } from './GroupOutputEditor.js';
import { NodeEditor } from '../NodeEditor.js';

export class GroupEditor extends BaseNodeEditor {

	constructor() {

		super( 'Group', null, 350 );

        this.inputEditor = null;
        this.inputElementsJSON = null;
        this.outputEditor = null;

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

    }

    updateOutputs() {

        this.value = this.outputEditor.value;
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
        const inputEditorElement = this.inputEditor.elements.find( ( obj ) => {

            return obj.attributeID == id;

        } );

        const updateInput = () => {

            element.setEnabledInputs( ! element.getLinkedObject() );
            if (inputEditorElement) inputEditorElement.attributeValue = element.getLinkedObject() ?? inputNode; // TODO: if can be removed if loading that way is removed

            this.inputEditor.invalidate();

        };

        if (inputEditorElement) inputEditorElement.attributeValue = inputNode; // TODO: if can be removed if loading that way is removed

        element.onConnect( () => updateInput(), true );
		element.addEventListener( 'changeInput', () => this.invalidate() );

        this.add( element );
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

    dispose() {

        super.dispose();

        //this.inputEditor.dispose();
        //this.outputEditor.dispose();
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
