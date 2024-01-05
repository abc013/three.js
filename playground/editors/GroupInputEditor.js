import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createElementFromJSON } from '../NodeEditorUtils.js';

export class GroupInputEditor extends BaseNodeEditor {

	constructor(parentGroupEditor) {

		super( 'Group Input', parentGroupEditor.value, 150 );

		this.setOutputLength( 1 );

        this.parentGroupEditor = parentGroupEditor;
	}

}
