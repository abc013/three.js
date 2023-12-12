import { LabelElement, ToggleInput, SelectInput } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { onValidNode, onValidType, getColorFromType } from '../NodeEditorUtils.js';
import { texture, uv } from 'three/nodes';
import { Texture, TextureLoader, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping } from 'three';

const textureLoader = new TextureLoader();
const defaultTexture = new Texture();

let defaultUV = null;

const getTexture = ( url ) => {

	return textureLoader.load( url );

};

export class TextureEditor extends BaseNodeEditor {

	constructor() {

		const node = texture( defaultTexture );

		super( 'Texture', node, 4, 250 );

		this.texture = null;

		this._initFile();
		this._initParams();

		this.onValidElement = () => {};

	}

	_initFile() {

		const fileElement = new LabelElement( 'File' ).setInputColor( getColorFromType( 'URL' ) ).setInput( 1 );

		fileElement.onValid( onValidType( 'URL' ) ).onConnect( () => {

			const textureNode = this.value;
			const fileEditorElement = fileElement.getLinkedElement();

			this.texture = fileEditorElement ? getTexture( fileEditorElement.node.getURL() ) : null;

			textureNode.value = this.texture || defaultTexture;

			this.update();

		}, true );

		this.add( fileElement );

	}

	_initParams() {

		const uvField = new LabelElement( 'UV' ).setInput( 2 );

		uvField.onValid( onValidNode ).onConnect( () => {

			const node = this.value;

			node.uvNode = uvField.getLinkedObject() || defaultUV || ( defaultUV = uv() );

		} );

		this.wrapSInput = new SelectInput( [
			{ name: 'Repeat Wrapping', value: RepeatWrapping },
			{ name: 'Clamp To Edge Wrapping', value: ClampToEdgeWrapping },
			{ name: 'Mirrored Repeat Wrapping', value: MirroredRepeatWrapping }
		], RepeatWrapping ).onChange( () => {

			this.update();

		} );

		this.wrapTInput = new SelectInput( [
			{ name: 'Repeat Wrapping', value: RepeatWrapping },
			{ name: 'Clamp To Edge Wrapping', value: ClampToEdgeWrapping },
			{ name: 'Mirrored Repeat Wrapping', value: MirroredRepeatWrapping }
		], RepeatWrapping ).onChange( () => {

			this.update();

		} );

		this.flipYInput = new ToggleInput( false ).onChange( () => {

			this.update();

		} );

		this.add( uvField )
			.add( new LabelElement( 'Wrap S' ).add( this.wrapSInput ) )
			.add( new LabelElement( 'Wrap T' ).add( this.wrapTInput ) )
			.add( new LabelElement( 'Flip Y' ).add( this.flipYInput ) );

	}

	update() {

		const texture = this.texture;

		if ( texture ) {

			texture.wrapS = Number( this.wrapSInput.getValue() );
			texture.wrapT = Number( this.wrapTInput.getValue() );
			texture.flipY = this.flipYInput.getValue();
			texture.dispose();

			this.invalidate();

		}

	}

}
