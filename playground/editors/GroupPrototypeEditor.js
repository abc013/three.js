import { LabelElement, Element, ButtonInput, StringInput } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { NodeEditor } from '../NodeEditor.js';
import { GroupInputEditor } from './GroupInputEditor.js';
import { GroupOutputEditor } from './GroupOutputEditor.js';
import { GroupEditor } from './GroupEditor.js';

export class GroupPrototypeEditor extends BaseNodeEditor {

	constructor() {
		super( 'Group Prototype', null, 350 );

		this.nameInput = new StringInput( "New Group" ).onChange( () => {

			// TODO

		} );

        var showNodes = new ButtonInput( "Show Graph" ).onClick( () => this.toggleNodeEditor() );

        this.add( new LabelElement( "Name" ).add(this.nameInput) )
            .add( new Element().add(showNodes) );
		
		this.nodeEditor = null;
		this.nodeEditorJSON = null;
	}

	serialize( data ) {

		super.serialize( data );

        // TODO: set group information

	}

	deserialize( data ) {

		super.deserialize( data );

        // TODO: get group information

	}

	deserializeLib( data, lib ) {

		super.deserializeLib( data, lib );

		/*this.source = data.source;

        // required for the prototype, as it seems.
		const nodePrototype = this.createPrototype();
		lib[ nodePrototype.name ] = nodePrototype.nodeClass;*/

	}

	setEditor( editor ) {

		super.setEditor( editor );

		/*if ( editor === null ) {

			for ( const proto of [ ...this.instances ] ) {

				proto.dispose();

			}

			this.instances = [];

		}

		this.updatePrototypes();*/

	}

	toggleNodeEditor() {

		if ( !this.nodeEditor ) {

			if ( this.nodeEditorJSON ) {

				this.loadNodeEditor();
				this.nodeEditor.visible = false;

			} else {

				this.createNodeEditor();
				this.nodeEditor.visible = false;

			}

		}

		this.nodeEditor.visible = !this.nodeEditor.visible;
		this.editor.visible = !this.nodeEditor.visible;
		// this.nodeEditor.preview = !this.nodeEditor.preview;

	}

	createNodeEditor() {

		const editor = this.editor;

        // TODO: nice, this works vaguely for now.
        const nodeEditor = new NodeEditor( editor.scene, editor.renderer, editor.composer, true, editor );
        document.body.appendChild( nodeEditor.domElement );

		this.nodeEditor = nodeEditor;

		this.onWindowResize();
		window.addEventListener( 'resize', this.onWindowResize );

		var groupEditor = new GroupEditor();
		this.editor.add( groupEditor );

        this.inputEditor = new GroupInputEditor();
        this.outputEditor = new GroupOutputEditor();

		groupEditor.setInputEditor( this.inputEditor );
		groupEditor.setOutputEditor( this.outputEditor );

        nodeEditor.add( this.inputEditor );
        nodeEditor.add( this.outputEditor );

	}

	onWindowResize() {

		const width = window.innerWidth;
		const height = window.innerHeight;

		this.nodeEditor.setSize( width, height );

	}

	loadNodeEditor() {

	}

	createPrototype() {

		if ( this._prototype !== null ) return this._prototype;

		const nodePrototype = this;
		const scriptableNode = this.scriptableNode;
		const editorElement = this.editorElement;

		const nodeClass = class extends ScriptableEditor {

			constructor() {

				super( scriptableNode.codeNode, false );

				this.serializePriority = - 1;

				this.onCode = this.onCode.bind( this );

			}

			onCode() {

				this.update();

			}

			setEditor( editor ) {

				super.setEditor( editor );

				const index = nodePrototype.instances.indexOf( this );

				if ( editor ) {

					if ( index === - 1 ) nodePrototype.instances.push( this );

					editorElement.addEventListener( 'change', this.onCode );

				} else {

					if ( index !== - 1 ) nodePrototype.instances.splice( index, 1 );

					editorElement.removeEventListener( 'change', this.onCode );

				}

			}

			get className() {

				return scriptableNode.getLayout().name;

			}

		};

		this._prototype = {
			get name() {

				return scriptableNode.getLayout().name;

			},
			get icon() {

				return scriptableNode.getLayout().icon;

			},
			nodeClass,
			reference: this,
			editor: this.editor
		};

		return this._prototype;

	}

	updatePrototypes() {

		if ( this._prototype !== null && this._prototype.editor !== null ) {

			this._prototype.editor.removeClass( this._prototype );

		}

		//

		const layout = this.scriptableNode.getLayout();

		if ( layout && layout.name ) {

			if ( this.editor ) {

				this.editor.addClass( this.createPrototype() );

			}

		}

	}

}
