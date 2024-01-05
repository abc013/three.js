import { LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';
import { GroupInputEditor } from './GroupInputEditor.js';
import { GroupOutputEditor } from './GroupOutputEditor.js';

export class GroupEditor extends BaseNodeEditor {

	constructor() {
		const { element, inputNode } = createElementFromJSON( {
			inputType: 'float',
			inputConnection: false
		} );

		super( 'Group', inputNode, 350 );

        var input = new LabelElement( 'Input' ).setInput(1);

        this.inputNode = inputNode;
        this.input = input;

        input.add(element);
        input.onConnect( () => this.updateInputs(), true );

		element.addEventListener( 'changeInput', () => this.invalidate() );

		this.add( input );

        this.inputEditor = new GroupInputEditor(this);
        this.outputEditor = new GroupOutputEditor(this);

        this.updateOutputs();
	}

    setEditor( editor ) {

        super.setEditor( editor );

        editor.add( this.inputEditor );
        editor.add( this.outputEditor );
    }

    updateInputs() {

		this.input.setEnabledInputs( ! this.input.getLinkedObject() );

        this.inputEditor.value = this.input.getLinkedObject() ?? this.inputNode;
        this.inputEditor.invalidate();
    }

    updateOutputs() {

        this.value = this.outputEditor.value;
        this.invalidate();

    }

    dispose() {

        super.dispose();

        this.inputEditor.dispose();
        this.outputEditor.dispose();
    }

}
