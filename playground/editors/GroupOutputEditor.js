import { LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';

export class GroupOutputEditor extends BaseNodeEditor {

	constructor(parentGroupEditor) {
		const { element, inputNode } = createElementFromJSON( {
			inputType: 'float',
			inputConnection: false
		} );

		super( 'Group Output', inputNode, 350 );

        this.parentGroupEditor = parentGroupEditor;

        var input = new LabelElement( 'Ouput' ).setInput(1);

        this.inputNode = inputNode;
        this.input = input;

        input.add(element);
        input.onConnect( () => this.update(), true );

		this.add( input );
	}

    update() {

		this.input.setEnabledInputs( ! this.input.getLinkedObject() );

        this.value = this.input.getLinkedObject() ?? this.inputNode; // TODO: change this.value here, its misleading.
        this.parentGroupEditor.updateOutputs();
    }

}
