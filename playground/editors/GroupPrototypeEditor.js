import { LabelElement, Element, ButtonInput, StringInput, Loader } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { GroupNodeEditor } from '../NodeEditor.js';
import { GroupInputEditor } from './GroupInputEditor.js';
import { GroupOutputEditor } from './GroupOutputEditor.js';
import { GroupEditor } from './GroupEditor.js';
import { ClassLib } from '../NodeEditorLib.js';

export class GroupPrototypeEditor extends BaseNodeEditor {

	constructor() {

		super( 'Group Prototype', null, 350 );

		this.nodeClass = new WeakMap();

		this.nameInput = new StringInput( "New Group" ).onChange( () => { this.updatePrototypes() } );

		const showNodes = new ButtonInput( "Show Graph" ).onClick( () => { this.toggleNodeEditor() } );
		const refreshButton = new ButtonInput( "Refresh instances " ).setIcon( 'ti ti-reload' ).onClick( () => { this.updatePrototypes() } );

		this.add( new LabelElement( "Name" ).add( this.nameInput ) )
			.add( new Element().add( showNodes ).add( refreshButton ) );

		this.nodeEditor = null;
		this.nodeEditorJSON = null;

		this._prototype = null;
		this.instances = [];

		this.updatePrototypes();

	}

	get groupName() {

		return this.nameInput.getValue();

	}

	set groupName(value) {

		this.nameInput.setValue(value);

	}

	deserializeLib( data, lib ) {

		super.deserializeLib( data, lib );

		if (data.nodeEditorJSON) {

			this.nodeEditorJSON = JSON.parse( data.nodeEditorJSON );

		}

		this.groupName = data.groupName;

		const nodePrototype = this.createPrototype();
		lib[ nodePrototype.name ] = nodePrototype.nodeClass;

	}

	setEditor( editor ) {

		if ( editor === null && this.editor ) {

			// TODO: also add this to NodePrototypeEditor. This is required because otherwise, classes are saved over editor instances (and save/load cycles)
			this.editor.removeClass(this.createPrototype());

		}

		super.setEditor( editor );

		if ( editor === null ) {

			for ( const proto of [ ...this.instances ] ) {

				proto.dispose();

			}

			this.instances = [];

		}

		this.updatePrototypes();

	}

	toggleNodeEditor() {

		if ( !this.nodeEditor ) {

			if ( this.nodeEditorJSON ) {

				this.loadNodeEditor();

			} else {

				this.createNodeEditor();

			}

			this.nodeEditor.visible = false;
		}

		this.nodeEditor.visible = !this.nodeEditor.visible;
		this.editor.visible = !this.nodeEditor.visible;

		// if (this.editor.visible) this.updatePrototypes(); // TODO: We just closed the node editor, thus update Prototypes; However, this doesnt work from inside the editor

	}

	createNodeEditor() {

		this._createNodeEditor();

		this.inputEditor = new GroupInputEditor();
		this.outputEditor = new GroupOutputEditor();

		this.nodeEditor.add( this.inputEditor );
		this.nodeEditor.add( this.outputEditor );

	}

	loadNodeEditor() {

		this._createNodeEditor();

		const loader = new Loader( Loader.OBJECTS );
		const json = loader.parse( this.nodeEditorJSON , ClassLib );

		this.nodeEditor.loadJSON( json );

		this.inputEditor = this.nodeEditor.canvas.nodes.find( ( node ) => node instanceof GroupInputEditor );
		this.outputEditor = this.nodeEditor.canvas.nodes.find( ( node ) => node instanceof GroupOutputEditor );

	}

	_createNodeEditor() {

		const editor = this.editor;

		const nodeEditor = new GroupNodeEditor( editor.scene, editor.renderer, editor.composer, editor, this );
		document.body.appendChild( nodeEditor.domElement );

		this.nodeEditor = nodeEditor;

		const onWindowResize = () => {

			const width = window.innerWidth;
			const height = window.innerHeight;
	
			this.nodeEditor.setSize( width, height );
	
		};

		onWindowResize();
		window.addEventListener( 'resize', onWindowResize );

	}

	createPrototype() {

		if ( this._prototype !== null ) return this._prototype;

		const nodePrototype = this;

		const nodeClass = class extends GroupEditor {

			constructor() {

				super( nodePrototype );

				this.serializePriority = - 1;

			}

			setEditor( editor ) {

				super.setEditor( editor );

				const index = nodePrototype.instances.indexOf( this );

				if ( editor ) {

					if ( index === - 1 ) nodePrototype.instances.push( this );

				} else {

					if ( index !== - 1 ) nodePrototype.instances.splice( index, 1 );

				}

			}

			get className() {

				return nodePrototype.groupName;

			}

		};

		this._prototype = {
			get name() {

				return nodePrototype.groupName;

			},
			icon: 'components',
			nodeClass,
			reference: this,
			editor: this.editor
		};

		return this._prototype;

	}

	updatePrototypes() {

		this.createNodeEditorJSON();

		if ( this._prototype !== null && this._prototype.editor !== null ) {

			this._prototype.editor.removeClass( this._prototype );

		}

		//

		if ( this.editor ) {

			this.editor.addClass( this.createPrototype() );
			this.instances.forEach( (instance) => instance.update() );

		}

	}

	createNodeEditorJSON() {

		if (!this.nodeEditor)
			return this.nodeEditorJSON;

		this.nodeEditorJSON = this.nodeEditor.canvas.toJSON();
		return this.nodeEditorJSON;

	}

	serialize( data ) {

		super.serialize( data );

		if (this.nodeEditor) {

			data.nodeEditorJSON = JSON.stringify( this.createNodeEditorJSON() );

		} else if ( this.stringifiedNodeEditorJSON ) {

			data.nodeEditorJSON = this.stringifiedNodeEditorJSON;

		}

		data.groupName = this.groupName;

	}

	deserialize( data ) {

		if (data.nodeEditorJSON) {

			this.stringifiedNodeEditorJSON = data.nodeEditorJSON;
			this.nodeEditorJSON = JSON.parse( data.nodeEditorJSON );

		}

		this.groupName = data.groupName;

		super.deserialize( data );

	}

}
