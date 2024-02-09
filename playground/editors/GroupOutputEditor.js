import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON, getColorFromType, onValidType } from '../NodeEditorUtils.js';

export class GroupOutputEditor extends BaseNodeEditor {

	constructor() {
		const inputType = 'float';

		super( 'Group Output', null, 350 );

		const { element, inputNode } = createElementFromJSON( {
			name: 'Output',
			inputType: inputType,
			inputConnection: false
		} );

		element.setInput(1); // TODO: somehow, using inputConnection == true doesn't work, but this does...

		this.inputNode = inputNode;
		this.input = element;
		
		element.onConnect( () => this.updateConnection(), true );

		this.value = inputNode;
		element.addEventListener( 'changeInput', () => this.invalidate() );

		this.add( element );
	}

	attachGroupEditor( editor ) {

		this.parentGroupEditor = editor;

	}

	updateConnection() {

		this.input.setEnabledInputs( ! this.input.getLinkedObject() );
		
		this.value = this.input.getLinkedObject() ?? this.inputNode; // TODO: change this.value here, its misleading.
		if (this.parentGroupEditor) this.parentGroupEditor.updateOutputs();

	}

	invalidate() {

		super.invalidate();

		if (this.parentGroupEditor) this.parentGroupEditor.invalidate();

	}
}
