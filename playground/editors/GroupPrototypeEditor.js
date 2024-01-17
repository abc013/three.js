import { LabelElement, Element, ButtonInput, StringInput, Loader } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { NodeEditor } from '../NodeEditor.js';
import { GroupInputEditor } from './GroupInputEditor.js';
import { GroupOutputEditor } from './GroupOutputEditor.js';
import { GroupEditor } from './GroupEditor.js';
import { ClassLib } from '../NodeEditorLib.js';

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

			} else {

				this.createNodeEditor();

			}

			this.nodeEditor.visible = false;
		}

		this.nodeEditor.visible = !this.nodeEditor.visible;
		this.editor.visible = !this.nodeEditor.visible;
		// this.nodeEditor.preview = !this.nodeEditor.preview;

	}

	createNodeEditor() {

		this._createNodeEditor();

		const groupEditor = new GroupEditor();
		this.editor.add( groupEditor );

        this.inputEditor = new GroupInputEditor();
        this.outputEditor = new GroupOutputEditor();

		//groupEditor.setInputEditor( this.inputEditor );
		//groupEditor.setOutputEditor( this.outputEditor );

        this.nodeEditor.add( this.inputEditor );
        this.nodeEditor.add( this.outputEditor );

	}

	loadNodeEditor() {

		this._createNodeEditor();

		const groupEditor = new GroupEditor();
		this.editor.add( groupEditor );

		const loader = new Loader( Loader.OBJECTS );
		const json = loader.parse( this.nodeEditorJSON , ClassLib );

		this.nodeEditor.loadJSON( json );

	}

	_createNodeEditor() {

		const editor = this.editor;

        const nodeEditor = new NodeEditor( editor.scene, editor.renderer, editor.composer, true, editor );
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

	serialize( data ) {

		super.serialize( data );

		if (this.nodeEditor) {

			data.nodeEditorJSON = JSON.stringify( this.nodeEditor.canvas.toJSON() );

		}

	}

	deserialize( data ) {

		if (data.nodeEditorJSON) {

			this.nodeEditorJSON = JSON.parse( data.nodeEditorJSON );

		}

		super.deserialize( data );

	}

}
