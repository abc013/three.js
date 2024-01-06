import { LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';
import { GroupInputEditor } from './GroupInputEditor.js';
import { GroupOutputEditor } from './GroupOutputEditor.js';
import { NodeEditor } from '../NodeEditor.js';
import { setOutputAestheticsFromNode } from '../DataTypeLib.js';

export class GroupEditor extends BaseNodeEditor {

	constructor() {

		super( 'Group', null, 350 );

        this.inputEditor = new GroupInputEditor(this);
        this.outputEditor = new GroupOutputEditor(this); // TODO: how do we save these?
	}

    setEditor( editor ) {

        super.setEditor( editor );

        // TODO: we get it, this works.
        /*var groupEditor = new NodeEditor( editor.scene, editor.renderer, editor.composer, true );
        var parent = document.createElement("div");
        parent.style.cssText = "margin: 10%;";
        parent.appendChild(groupEditor.domElement);
        document.body.appendChild(parent);

        groupEditor.add( this.inputEditor );
        groupEditor.add( this.outputEditor );*/

        editor.add( this.inputEditor );
        editor.add( this.outputEditor );

        this.updateOutputs();
    }

    updateOutputs() {

        this.value = this.outputEditor.value;
        setOutputAestheticsFromNode( this.title, this.value );
        this.invalidate();

    }

    addInputFromJSON( json ) {
		// JSON layout: { id: <id>, name: <name>, type: <type> }
        const { id, name, type } = json;

        const input = new LabelElement(name).setInput(1);

		const { element, inputNode } = createElementFromJSON( {
			inputType: type,
			inputConnection: false
		} );

        // there has to be a corresponding field in the inputEditor elements
        const inputEditorElement = this.inputEditor.elements.find( ( obj ) => {

            return obj.attributeID == id;

        } );

        const updateInput = () => {

            input.setEnabledInputs( ! input.getLinkedObject() );
            inputEditorElement.attributeValue = input.getLinkedObject() ?? inputNode;

            this.inputEditor.invalidate();

        };

        inputEditorElement.attributeValue = inputNode;

        input.onConnect( () => updateInput(), true );

        input.add( element );

		element.addEventListener( 'changeInput', () => this.invalidate() );

        this.add( input );
    }

    setInputs( elements ) {

        this.clearLayout();

        elements.forEach( (element) => {

            this.addInputFromJSON( element );

        } );
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

        this.inputEditor.dispose();
        this.outputEditor.dispose();
    }

}
