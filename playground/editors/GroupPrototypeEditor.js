import { LabelElement, Element, ButtonInput, StringInput } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';

export class GroupPrototypeEditor extends BaseNodeEditor {

	constructor() {
		super( 'Group Prototype', null, 350 );

		this.nameInput = new StringInput( "New Group" );

        var showNodes = new ButtonInput( "Show Graph" );

        this.add( new LabelElement( "Name" ).add(this.nameInput) )
            .add( new Element().add(showNodes) );
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
