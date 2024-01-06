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

        // For now, this is the way we create groups. But soon, we don't want to do it that way, but rather load our group from a json and then attach ourselves to in- and outputs.
        this.inputEditor = new GroupInputEditor();
        this.outputEditor = new GroupOutputEditor();

        this.inputEditor.attachGroupEditor(this);
        this.outputEditor.attachGroupEditor(this);

        this.updateOutputs();
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

        if ( editor != null ) {

            editor.add( this.inputEditor );
            editor.add( this.outputEditor );

        }
    }

    updateOutputs() {

        this.value = this.outputEditor.value;
        setOutputAestheticsFromNode( this.title, this.value );
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
        const inputEditorElement = this.inputEditor.elements.find( ( obj ) => {

            return obj.attributeID == id;

        } );

        const updateInput = () => {

            element.setEnabledInputs( ! element.getLinkedObject() );
            inputEditorElement.attributeValue = element.getLinkedObject() ?? inputNode;

            this.inputEditor.invalidate();

        };

        inputEditorElement.attributeValue = inputNode;

        element.onConnect( () => updateInput(), true );
		element.addEventListener( 'changeInput', () => this.invalidate() );

        this.add( element );
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

        //this.inputEditor.dispose();
        //this.outputEditor.dispose();
    }

}
