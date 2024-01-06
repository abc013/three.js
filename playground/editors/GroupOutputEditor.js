import { LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';

export class GroupOutputEditor extends BaseNodeEditor {

	constructor(parentGroupEditor) {

		super( 'Group Output', null, 350 );

        this.parentGroupEditor = parentGroupEditor;

		const { element, inputNode } = createElementFromJSON( {
			inputType: 'float',
			inputConnection: false
		} );

        var input = new LabelElement( 'Output' ).setInput(1);

        this.inputNode = inputNode;
        this.input = input;

        input.add(element);
        input.onConnect( () => this.updateConnection(), true );

        element.addEventListener( 'changeInput', () => this.invalidate() );

		this.add( input );

        this.value = inputNode;
	}

    updateConnection() {

		this.input.setEnabledInputs( ! this.input.getLinkedObject() );

        this.value = this.input.getLinkedObject() ?? this.inputNode; // TODO: change this.value here, its misleading.
        this.parentGroupEditor.updateOutputs();

    }

    invalidate() {

        super.invalidate();

        this.parentGroupEditor.invalidate();

    }
}
